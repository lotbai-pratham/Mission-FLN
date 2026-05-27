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
  if (str.includes('10-99') || str.includes('10 ते 99') || str.includes('100') || str.includes('999')) return 2;
  if (str.includes('addition') || str.includes('बेरीज')) return 3;
  if (str.includes('subtraction') || str.includes('वजाबाकी') || str.includes('multiplication') || str.includes('गुणाकार')) return 4;
  if (str.includes('division') || str.includes('भागाकार')) return 6;
  return 0;
}

function resolveAssessments(assessments: any[], term: string) {
  if (assessments.length === 0) return null;
  if (assessments.length === 1) return assessments[0];
  
  const termLower = term.toLowerCase();
  if (termLower.includes('baseline')) {
    // Keep lowest level
    assessments.sort((a, b) => {
      const sumA = a.literacyLevel + a.numeracyLevel;
      const sumB = b.literacyLevel + b.numeracyLevel;
      if (sumA !== sumB) return sumA - sumB;
      const timeA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const timeB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return timeA - timeB;
    });
    return assessments[0];
  } else if (termLower.includes('endline')) {
    // Keep highest level
    assessments.sort((a, b) => {
      const sumA = a.literacyLevel + a.numeracyLevel;
      const sumB = b.literacyLevel + b.numeracyLevel;
      if (sumA !== sumB) return sumB - sumA;
      const timeA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const timeB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return timeB - timeA;
    });
    return assessments[0];
  } else {
    // Midline (or other): keep closest to average
    const count = assessments.length;
    const avgLit = assessments.reduce((sum, a) => sum + a.literacyLevel, 0) / count;
    const avgNum = assessments.reduce((sum, a) => sum + a.numeracyLevel, 0) / count;

    let minDistance = Infinity;
    let kept = assessments[0];
    
    for (const a of assessments) {
      const dist = Math.abs(a.literacyLevel - avgLit) + Math.abs(a.numeracyLevel - avgNum);
      if (dist < minDistance) {
        minDistance = dist;
        kept = a;
      }
    }
    return kept;
  }
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
  divisionOp: ['Division (भागाकार)', 'Division Fun', 'भागाकार']
};

export async function POST(req: Request) {
  const session = await auth();
  if (!hasRole(session, "admin")) {
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
    const schoolMap = new Map<string, typeof allSchools[0]>();
    allSchools.forEach(s => {
      const key = `${normalize(s.projectOffice.division.name)}-${normalize(s.projectOffice.name)}-${normalize(s.name)}`;
      schoolMap.set(key, s);
    });

    const failedRows: any[] = [];
    const studentsToCreate: any[] = [];
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
      const schObj = schoolMap.get(lookupKey);
      const sId = schObj?.id;
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
        // Generate deterministic UID
        const divPart = schObj?.projectOffice.division.name.slice(0, 2).toUpperCase() || 'XX';
        const poPart = schObj?.projectOffice.name.slice(0, 2).toUpperCase() || 'XX';
        const schPart = schObj?.name.slice(0, 2).toUpperCase() || 'XX';
        const cleanName = stdName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'STU';
        
        const fullKey = `${schObj?.name}-${classNum}-${stdName}`;
        let hash = 0;
        for (let idx = 0; idx < fullKey.length; idx++) {
          hash = (hash << 5) - hash + fullKey.charCodeAt(idx);
          hash |= 0;
        }
        const hashPartVal = Math.abs(hash).toString(36).toUpperCase().slice(0, 4);
        const uid = `ST-${divPart}${poPart}${schPart}-${classNum}-${cleanName}-${hashPartVal}`;

        studentsToCreate.push({ uid, name: stdName, class: classNum, gender, schoolId: sId });
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

    const latestAssessments = new Map<string, any[]>();

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

      const key = `${sid}-${term}`;
      const assessmentData = {
        date, 
        term, 
        assessorName: getRowValue(row, COLS.assessor) || 'Unknown Assessor',
        literacyLevel: parseLiteracyLevel(getRowValue(row, COLS.literacy)),
        numeracyLevel: parseNumeracyLevel(getRowValue(row, COLS.numeracy)),
        addition: checkOp(getRowValue(row, COLS.addition)),
        subtraction: checkOp(getRowValue(row, COLS.subtraction)),
        division: checkOp(getRowValue(row, COLS.divisionOp)),
        studentId: sid
      };

      if (!latestAssessments.has(key)) {
        latestAssessments.set(key, []);
      }
      latestAssessments.get(key)!.push(assessmentData);
    }

    const studentIds = Array.from(new Set(Array.from(latestAssessments.keys()).map(k => k.split('-')[0])));
    const dbAssessments = await prisma.assessment.findMany({
      where: {
        studentId: { in: studentIds },
        term
      }
    });

    const dbMap = new Map<string, any[]>();
    for (const a of dbAssessments) {
      const k = `${a.studentId}-${a.term}`;
      if (!dbMap.has(k)) dbMap.set(k, []);
      dbMap.get(k)!.push(a);
    }

    const assessmentsToInsert: any[] = [];
    const deleteIds: string[] = [];

    for (const [key, fileAssessments] of latestAssessments.entries()) {
      const dbAssessmentsForKey = dbMap.get(key) || [];
      const combined = [...fileAssessments, ...dbAssessmentsForKey];
      
      const resolved = resolveAssessments(combined, term);
      if (resolved) {
        const resolvedId = (resolved as any).id;
        
        for (const dbA of dbAssessmentsForKey) {
          if (dbA.id !== resolvedId) {
            deleteIds.push(dbA.id);
          }
        }

        if (!resolvedId) {
          assessmentsToInsert.push(resolved);
        }
      }
    }

    if (deleteIds.length > 0) {
      for (let i = 0; i < deleteIds.length; i += 500) {
        await prisma.assessment.deleteMany({
          where: { id: { in: deleteIds.slice(i, i + 500) } }
        });
      }
    }

    for (let i = 0; i < assessmentsToInsert.length; i += 500) {
      await (prisma.assessment as any).createMany({ data: assessmentsToInsert.slice(i, i + 500) });
    }

    return NextResponse.json({ 
      success: true, 
      count: assessmentsToInsert.length,
      failedRows: failedRows.length > 0 ? failedRows : undefined 
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
