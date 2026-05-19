import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as xlsx from 'xlsx';
import { auth } from '@/auth';

// Helper to match column names case-insensitively and with fallback aliases
function getRowValue(row: any, aliases: string[]): string {
  // 1. Try exact matches first
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null) {
      return String(row[alias]).trim();
    }
  }
  
  // 2. Try normalized substring matching (remove spaces, case-insensitive)
  const rowKeys = Object.keys(row);
  for (const alias of aliases) {
    const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normalizedAlias) continue;
    
    const foundKey = rowKeys.find(rk => {
      const normalizedKey = rk.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedKey.includes(normalizedAlias);
    });
    
    if (foundKey !== undefined && row[foundKey] !== null && row[foundKey] !== undefined) {
      return String(row[foundKey]).trim();
    }
  }
  
  return '';
}

// Matching the logic used in seed to parse levels correctly
function parseLiteracyLevel(val: string) {
  if (!val) return 0;
  const str = String(val).toLowerCase();
  if (str.includes('beginner') || str.includes('प्रारंभिक')) return 0;
  if (str.includes('letter') || str.includes('अक्षर')) return 1;
  if (str.includes('word') || str.includes('शब्द')) return 2;
  if (str.includes('paragraph') || str.includes('उतारा')) return 3;
  if (str.includes('story') || str.includes('गोष्ट')) return 4;
  return 0;
}

function parseNumeracyLevel(val: string) {
  if (!val) return 0;
  const str = String(val).toLowerCase();
  if (str.includes('beginner') || str.includes('प्रारंभिक')) return 0;
  if (str.includes('1-9') || str.includes('1 ते 9')) return 1;
  if (str.includes('10-99') || str.includes('10 ते 99')) return 2;
  // Extended 8-tier logic
  if (str.includes('100') || str.includes('999')) return 3;
  if (str.includes('addition') || str.includes('बेरीज')) return 4;
  if (str.includes('subtraction') || str.includes('वजाबाकी')) return 5;
  if (str.includes('multiplication') || str.includes('गुणाकार')) return 6;
  if (str.includes('division') || str.includes('भागाकार')) return 7;
  return 0;
}

// Column aliases for robust sheet parsing
const COLS = {
  division: ['Please select Division', 'Division Name', 'Division_Name', 'Division', 'विभाग'],
  projectOffice: ['Please select project office', 'Project Office', 'Project_Office', 'office', 'po', 'केंद्र'],
  schoolName: ['School Name', 'School_Name', 'School', 'शाळा'],
  studentName: ['Write Student Name (विद्यार्थ्याचे नाव लिहा)', 'Student Name', 'Student_Name', 'Student', 'विद्यार्थ्याचे नाव', 'नाव'],
  gender: ['Please select student gender (कृपया विद्यार्थी लिंग निवडा)', 'Student Gender', 'Gender', 'लिंग'],
  class: ['Please select assessment class (कृपया मूल्यांकन वर्ग निवडा)', 'Student Class', 'Class', 'वर्ग'],
  date: ['Date of Assessment', 'Date_of_Assessment', 'Date', 'दिनांक'],
  assessor: ['Please select your name', 'Assessor Name', 'Assessor_Name', 'Assessor', 'मूल्यमापनकर्ता'],
  literacy: ['Marathi Language', 'Marathi (मराठी)', 'Literacy Level', 'Literacy', 'भाषा'],
  numeracy: ['Math Recognition (गणित ओळख)', 'Math Recognition', 'Numeracy Level', 'Numeracy', 'गणित ओळख', 'गणित'],
  addition: ['Addition (बेरीज)', 'Addition', 'बेरीज'],
  subtraction: ['Subtraction (वजाबाकी)', 'Subtraction', 'वजाबाकी'],
  multiplication: ['Multiplication (गुणाकार)', 'Multiplication', 'गुणाकार'],
  divisionOp: ['Division (भागाकार)', 'Division Fun', 'भागाकार']
};

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const term = formData.get('term') as string || "Baseline";
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    if (!rows || rows.length === 0) return NextResponse.json({ error: "File contains no data." }, { status: 400 });

    // --- PHASE 1: FETCH MASTER LIST FOR LOOKUP ---
    const allDivisions = await prisma.division.findMany();
    const allPOs = await prisma.projectOffice.findMany();
    const allSchools = await prisma.school.findMany({
      include: { projectOffice: { include: { division: true } } }
    });

    // Lookup Maps (normalized names for match resilience)
    const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');
    
    const divMap = new Map(allDivisions.map(d => [normalize(d.name), d.id]));
    const poMap = new Map(allPOs.map(p => [`${p.divisionId}-${normalize(p.name)}`, p.id]));
    const schoolMap = new Map();
    allSchools.forEach(s => {
      const key = `${normalize(s.projectOffice.division.name)}-${normalize(s.projectOffice.name)}-${normalize(s.name)}`;
      schoolMap.set(key, s.id);
    });

    const failedRows: any[] = [];
    const studentsToCreate: any[] = [];
    const assessmentsToCreate: any[] = [];
    const seenStudents = new Set<string>();

    // --- PHASE 2: VALIDATE & PREP DATA ---
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dName = getRowValue(row, COLS.division);
      const pName = getRowValue(row, COLS.projectOffice);
      const sName = getRowValue(row, COLS.schoolName);
      const stdName = getRowValue(row, COLS.studentName);

      if (!dName || !pName || !sName || !stdName) {
        failedRows.push({ 
          row: i + 2, 
          error: `Missing required fields. Got Division: "${dName}", PO: "${pName}", School: "${sName}", Student: "${stdName}"` 
        });
        continue;
      }

      // Check hierarchy match
      const lookupKey = `${normalize(dName)}-${normalize(pName)}-${normalize(sName)}`;
      const sId = schoolMap.get(lookupKey);
      if (!sId) {
        failedRows.push({ 
          row: i + 2, 
          school: sName, 
          error: `School "${sName}" under PO "${pName}" and Division "${dName}" not found in Master List. Check for spelling mismatches.` 
        });
        continue;
      }

      const gender = getRowValue(row, COLS.gender) || 'Unknown';
      const classStr = getRowValue(row, COLS.class);
      const classNum = classStr.match(/\d+/) ? parseInt(classStr.match(/\d+/)![0], 10) : 1;

      // Ensure student exists (unique by school + name + class in our updated model)
      const studentKey = `${sId}-${normalize(stdName)}-${classNum}`;
      if (!seenStudents.has(studentKey)) {
        studentsToCreate.push({ name: stdName, class: classNum, gender, schoolId: sId });
        seenStudents.add(studentKey);
      }
    }

    // --- PHASE 3: BATCH STUDENT INGEST ---
    // Using skipDuplicates: true to handle overlapping students
    for (let i = 0; i < studentsToCreate.length; i += 500) {
      await (prisma.student as any).createMany({ data: studentsToCreate.slice(i, i + 500), skipDuplicates: true });
    }

    // --- PHASE 4: PREP ASSESSMENTS (Need Student IDs) ---
    const allStudentsInScope = await prisma.student.findMany({ 
      where: { schoolId: { in: Array.from(new Set(studentsToCreate.map(s => s.schoolId))) } } 
    });
    const studentIdMap = new Map(allStudentsInScope.map(st => [`${st.schoolId}-${normalize(st.name)}-${st.class}`, st.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dName = getRowValue(row, COLS.division);
      const pName = getRowValue(row, COLS.projectOffice);
      const sName = getRowValue(row, COLS.schoolName);
      const stdName = getRowValue(row, COLS.studentName);
      
      const sId = schoolMap.get(`${normalize(dName)}-${normalize(pName)}-${normalize(sName)}`);
      if (!sId) continue; // Already logged in failedRows
      
      const classStr = getRowValue(row, COLS.class);
      const classNum = classStr.match(/\d+/) ? parseInt(classStr.match(/\d+/)![0], 10) : 1;
      
      const sid = studentIdMap.get(`${sId}-${normalize(stdName)}-${classNum}`);
      if (!sid) continue;

      const dateVal = getRowValue(row, COLS.date);
      let date = new Date();
      if (dateVal) {
        const numDate = Number(dateVal);
        if (!isNaN(numDate)) {
          date = new Date(Math.round((numDate - 25569) * 86400 * 1000));
        } else {
          const parsed = Date.parse(dateVal);
          if (!isNaN(parsed)) date = new Date(parsed);
        }
      }

      const checkOp = (val: string) => {
        const s = val.toLowerCase();
        return s.includes('can do') || s.includes('kar shakte') || s.includes('yes') || s === '1' || s === 'true';
      };

      assessmentsToCreate.push({
        date, 
        term, 
        assessorName: getRowValue(row, COLS.assessor) || 'Unknown Assessor',
        literacyLevel: parseLiteracyLevel(getRowValue(row, COLS.literacy)),
        numeracyLevel: parseNumeracyLevel(getRowValue(row, COLS.numeracy)),
        addition: checkOp(getRowValue(row, COLS.addition)),
        subtraction: checkOp(getRowValue(row, COLS.subtraction)),
        multiplication: checkOp(getRowValue(row, COLS.multiplication)),
        division: checkOp(getRowValue(row, COLS.divisionOp)),
        studentId: sid
      });
    }

    // Phase 5: Chunked assessment creation
    for (let i = 0; i < assessmentsToCreate.length; i += 500) {
      await (prisma.assessment as any).createMany({ data: assessmentsToCreate.slice(i, i + 500) });
    }

    return NextResponse.json({ 
      success: true, 
      count: assessmentsToCreate.length,
      failedRows: failedRows.length > 0 ? failedRows : undefined 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
