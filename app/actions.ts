"use server";
import { prisma } from "@/lib/db";
import { hasRole, getScopeFilters } from "@/lib/checkAccess";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function getSchools() {
  return await prisma.school.findMany({
    orderBy: { name: 'asc' },
    include: { projectOffice: { include: { division: true } } }
  });
}

export async function getDivisions() {
  return await prisma.division.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getProjectOffices() {
  return await prisma.projectOffice.findMany({
    orderBy: { name: 'asc' },
    include: { division: true }
  });
}


export async function getStudentsBySchool(schoolId: string) {
  return await prisma.student.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' }
  });
}

export async function getStudentsList(query: string = "", page: number = 1, divId?: string, poId?: string, schoolId?: string, classNum?: string) {
  const take = 20;
  const skip = (page - 1) * take;

  // Scope to the logged-in user's hierarchy using helper
  const session = await auth();
  const scope = getScopeFilters(session);

  const whereFilter: any = {};
  if (query) {
    whereFilter.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { uid: { contains: query, mode: 'insensitive' } }
    ];
  }

  // Merge explicit filters if provided and user is admin
  if (Object.keys(scope).length === 0) {
    if (schoolId) whereFilter.schoolId = schoolId;
    else if (poId) whereFilter.school = { projectOfficeId: poId };
    else if (divId) whereFilter.school = { projectOffice: { divisionId: divId } };
  } else {
    Object.assign(whereFilter, scope);
  }

  if (classNum && classNum !== 'all') {
    whereFilter.class = Number(classNum);
  }

  const students = await prisma.student.findMany({
    where: whereFilter,
    include: { 
      school: true,
      _count: {
        select: { assessments: true }
      }
    },
    orderBy: [
      {
        assessments: {
          _count: 'desc'
        }
      },
      {
        name: 'asc'
      }
    ],
    take,
    skip
  });

  const total = await prisma.student.count({ where: whereFilter });
  return { students, total, pages: Math.ceil(total / take) };
}

export async function getStudentProfile(studentId: string) {
  const session = await auth();
  const scope = getScopeFilters(session);
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: { include: { projectOffice: { include: { division: true } } } },
      assessments: { orderBy: { date: 'desc' } },
      singleGames: { orderBy: { conductedAt: 'desc' } },
      battlesAsP1: {
        include: {
          player1: { select: { id: true, name: true } },
          player2: { select: { id: true, name: true } },
          winner: { select: { id: true, name: true } }
        },
        orderBy: { conductedAt: 'desc' }
      },
      battlesAsP2: {
        include: {
          player1: { select: { id: true, name: true } },
          player2: { select: { id: true, name: true } },
          winner: { select: { id: true, name: true } }
        },
        orderBy: { conductedAt: 'desc' }
      }
    }
  });

  if (student && Object.keys(scope).length > 0) {
    if (scope.schoolId && student.schoolId !== scope.schoolId) throw new Error("Access denied");
    if (scope.projectOfficeId && student.school.projectOfficeId !== scope.projectOfficeId) throw new Error("Access denied");
    if (scope.divisionId && student.school.projectOffice.divisionId !== scope.divisionId) throw new Error("Access denied");
  }

  return student;
}

// -- ANALYTICS --

export async function getHierarchy() {
  return await prisma.division.findMany({
    orderBy: { name: 'asc' },
    include: {
      projectOffices: {
        orderBy: { name: 'asc' },
        include: {
          schools: { orderBy: { name: 'asc' } }
        }
      }
    }
  });
}

export async function getDashboardStats(filters: { divisionId?: string, projectOfficeId?: string, schoolId?: string, term?: string, classNum?: number | 'all' } = {}) {
  const session = await auth();
  const scope = getScopeFilters(session);
  const whereFilter: any = {};
  // Apply RBAC scope filters
  if (Object.keys(scope).length === 0) {
    // admin – use explicit filters if provided
    if (filters.schoolId) whereFilter.schoolId = filters.schoolId;
    else if (filters.projectOfficeId) whereFilter.school = { projectOfficeId: filters.projectOfficeId };
    else if (filters.divisionId) whereFilter.school = { projectOffice: { divisionId: filters.divisionId } };
  } else {
    // Non-admin: map scope to same shape as original logic
    if (scope.schoolId) whereFilter.schoolId = scope.schoolId;
    else if (scope.projectOfficeId) whereFilter.school = { projectOfficeId: scope.projectOfficeId };
    else if (scope.divisionId) whereFilter.school = { projectOffice: { divisionId: scope.divisionId } };
  }

  if (filters.classNum && filters.classNum !== 'all') {
    whereFilter.class = Number(filters.classNum);
  }

  const assessmentWhere: any = { student: whereFilter };
  if (filters.term) assessmentWhere.term = filters.term;


  // Build schoolWhere based on scope or admin filters
  const schoolWhere: any = {};
  if (Object.keys(scope).length === 0) {
    if (filters.schoolId) schoolWhere.id = filters.schoolId;
    else if (filters.projectOfficeId) schoolWhere.projectOfficeId = filters.projectOfficeId;
    else if (filters.divisionId) schoolWhere.projectOffice = { divisionId: filters.divisionId };
  } else {
    Object.assign(schoolWhere, scope);
  }

  const studentCountWhere: any = { ...whereFilter };
  if (filters.term) {
    studentCountWhere.assessments = {
      some: { term: filters.term }
    };
  } else {
    studentCountWhere.assessments = {
      some: {}
    };
  }

  const [totalStudents, totalAssessments, totalSchools, totalArenaBattles, totalSingleGames, literacies, numeracies, allAssessments] = await Promise.all([
    prisma.student.count({ where: studentCountWhere }),
    prisma.assessment.count({ where: assessmentWhere }),
    prisma.school.count({ where: schoolWhere }),
    // @ts-ignore
    prisma.battleRecord.count({
      where: {
        school: whereFilter.schoolId ? undefined : whereFilter.school,
        schoolId: whereFilter.schoolId || undefined,
        classNum: (filters.classNum && filters.classNum !== 'all') ? Number(filters.classNum) : undefined
      }
    }),
    prisma.singleGameRecord.count({
      where: {
        school: whereFilter.schoolId ? undefined : whereFilter.school,
        schoolId: whereFilter.schoolId || undefined,
      }
    }),
    prisma.assessment.groupBy({
      by: ['academicYear', 'term', 'literacyLevel'] as any,
      where: assessmentWhere,
      _count: { studentId: true }
    }),
    prisma.assessment.groupBy({
      by: ['academicYear', 'term', 'numeracyLevel'] as any,
      where: assessmentWhere,
      _count: { studentId: true }
    }),
    // Fetch all assessments with student class for class-wise breakdown
    prisma.assessment.findMany({
      where: assessmentWhere,
      select: {
        term: true,
        academicYear: true,
        literacyLevel: true,
        numeracyLevel: true,
        addition: true,
        subtraction: true,
        division: true,
        student: { select: { class: true } }
      }
    }),
  ]);

  // Operations by term
  const operations = allAssessments.reduce((acc: any, curr: any) => {
    if (!acc[curr.term]) acc[curr.term] = { addition: 0, subtraction: 0, division: 0, total: 0 };
    acc[curr.term].total += 1;
    const hasAdd = curr.addition || curr.numeracyLevel >= 3;
    const hasSub = curr.subtraction || curr.numeracyLevel >= 4;
    const hasDiv = curr.division || curr.numeracyLevel >= 6;
    if (hasAdd) acc[curr.term].addition += 1;
    if (hasSub) acc[curr.term].subtraction += 1;
    if (hasDiv) acc[curr.term].division += 1;
    return acc;
  }, {});

  // --- CLASS-WISE LEVEL BREAKDOWN ---
  // Structure: classLit[classNum][term][level] = count
  const TERMS = ['Baseline', 'Midline', 'Endline'];
  const classLit: Record<number, Record<string, Record<number, number>>> = {};
  const classNum: Record<number, Record<string, Record<number, number>>> = {};

  for (const a of allAssessments) {
    const cls = (a as any).student.class as number;
    if (!classLit[cls]) classLit[cls] = {};
    if (!classLit[cls][a.term]) classLit[cls][a.term] = {};
    classLit[cls][a.term][a.literacyLevel] = (classLit[cls][a.term][a.literacyLevel] || 0) + 1;

    if (!classNum[cls]) classNum[cls] = {};
    if (!classNum[cls][a.term]) classNum[cls][a.term] = {};
    const mappedNumLvl = a.numeracyLevel === 6 ? 5 : a.numeracyLevel === 5 ? 4 : a.numeracyLevel;
    classNum[cls][a.term][mappedNumLvl] = (classNum[cls][a.term][mappedNumLvl] || 0) + 1;
  }

  // Convert to percentage + count per (class, term, level)
  // Output: { [cls]: { [term]: { total, levels: { [level]: { count, pct } } } } }
  function computePcts(raw: Record<number, Record<string, Record<number, number>>>) {
    const result: Record<number, Record<string, { total: number; levels: Record<number, { count: number; pct: number }> }>> = {};
    for (const cls of Object.keys(raw).map(Number)) {
      result[cls] = {};
      for (const term of Object.keys(raw[cls])) {
        const levelCounts = raw[cls][term];
        const total = Object.values(levelCounts).reduce((s, v) => s + v, 0);
        result[cls][term] = {
          total,
          levels: Object.fromEntries(
            Object.entries(levelCounts).map(([lvl, count]) => [
              lvl,
              { count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
            ])
          )
        };
      }
    }
    return result;
  }

  // Also compute overall (all classes) breakdown
  const overallLit: Record<string, Record<number, number>> = {};
  const overallNum: Record<string, Record<number, number>> = {};
  for (const a of allAssessments) {
    if (!overallLit[a.term]) overallLit[a.term] = {};
    overallLit[a.term][a.literacyLevel] = (overallLit[a.term][a.literacyLevel] || 0) + 1;
    if (!overallNum[a.term]) overallNum[a.term] = {};
    const mappedNumLvl = a.numeracyLevel === 6 ? 5 : a.numeracyLevel === 5 ? 4 : a.numeracyLevel;
    overallNum[a.term][mappedNumLvl] = (overallNum[a.term][mappedNumLvl] || 0) + 1;
  }

  function computeOverallPcts(raw: Record<string, Record<number, number>>) {
    const result: Record<string, { total: number; levels: Record<number, { count: number; pct: number }> }> = {};
    for (const term of Object.keys(raw)) {
      const total = Object.values(raw[term]).reduce((s, v) => s + v, 0);
      result[term] = {
        total,
        levels: Object.fromEntries(
          Object.entries(raw[term]).map(([lvl, count]) => [
            lvl,
            { count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }
          ])
        )
      };
    }
    return result;
  }

  const availableClasses = Object.keys(classLit).map(Number).sort((a, b) => a - b);

  return {
    totalStudents,
    totalAssessments,
    totalSchools,
    totalArenaBattles,
    totalSingleGames,
    literacies,
    numeracies,
    operations,
    classBreakdown: {
      literacy: computePcts(classLit),
      numeracy: computePcts(classNum),
    },
    overallBreakdown: {
      literacy: computeOverallPcts(overallLit),
      numeracy: computeOverallPcts(overallNum),
    },
    availableClasses,
  };
}

export async function getCohortStats(filters: { divisionId?: string, projectOfficeId?: string, schoolId?: string, startTerm: string, endTerm: string }) {
  const session = await auth();
  const userSchoolId = (session?.user as any)?.schoolId;
  const userPOId = (session?.user as any)?.projectOfficeId;
  const userDivId = (session?.user as any)?.divisionId;

  const whereFilter: any = {};
  if (userSchoolId) {
    whereFilter.schoolId = userSchoolId;
  } else if (userPOId) {
    whereFilter.school = { projectOfficeId: userPOId };
  } else if (userDivId) {
    whereFilter.school = { projectOffice: { divisionId: userDivId } };
  } else {
    // Admin filters
    if (filters.schoolId) {
      whereFilter.schoolId = filters.schoolId;
    } else if (filters.projectOfficeId) {
      whereFilter.school = { projectOfficeId: filters.projectOfficeId };
    } else if (filters.divisionId) {
      whereFilter.school = { projectOffice: { divisionId: filters.divisionId } };
    }
  }

  // Get all students matching the filters
  const students = await prisma.student.findMany({
    where: whereFilter,
    include: {
      assessments: {
        where: {
          term: { in: [filters.startTerm, filters.endTerm] }
        }
      }
    }
  });

  // Calculate transitions
  const litTransitions: Record<string, number> = {};
  const numTransitions: Record<string, number> = {};
  const opsTransitions: Record<string, any> = {
    addition: { gained: 0, maintained: 0, regressed: 0, stagnant: 0 },
    subtraction: { gained: 0, maintained: 0, regressed: 0, stagnant: 0 },
    division: { gained: 0, maintained: 0, regressed: 0, stagnant: 0 }
  };

  students.forEach(student => {
    const startAssessment = student.assessments.find(a => a.term === filters.startTerm);
    const endAssessment = student.assessments.find(a => a.term === filters.endTerm);

    if (startAssessment && endAssessment) {
      // Literacy transition
      const litKey = `${startAssessment.literacyLevel}to${endAssessment.literacyLevel}`;
      litTransitions[litKey] = (litTransitions[litKey] || 0) + 1;

      // Numeracy transition
      const startNum = startAssessment.numeracyLevel === 6 ? 5 : startAssessment.numeracyLevel === 5 ? 4 : startAssessment.numeracyLevel;
      const endNum = endAssessment.numeracyLevel === 6 ? 5 : endAssessment.numeracyLevel === 5 ? 4 : endAssessment.numeracyLevel;
      const numKey = `${startNum}to${endNum}`;
      numTransitions[numKey] = (numTransitions[numKey] || 0) + 1;

      // Operations transitions
      const hasAddStart = startAssessment.addition || startAssessment.numeracyLevel >= 3;
      const hasAddEnd = endAssessment.addition || endAssessment.numeracyLevel >= 3;
      const hasSubStart = startAssessment.subtraction || startAssessment.numeracyLevel >= 4;
      const hasSubEnd = endAssessment.subtraction || endAssessment.numeracyLevel >= 4;
      const hasDivStart = startAssessment.division || startAssessment.numeracyLevel >= 6;
      const hasDivEnd = endAssessment.division || endAssessment.numeracyLevel >= 6;

      const opStatesStart = { addition: hasAddStart, subtraction: hasSubStart, division: hasDivStart };
      const opStatesEnd = { addition: hasAddEnd, subtraction: hasSubEnd, division: hasDivEnd };

      ['addition', 'subtraction', 'division'].forEach(op => {
         const start = (opStatesStart as any)[op];
         const end = (opStatesEnd as any)[op];
         if (!start && end) opsTransitions[op].gained++;
         else if (start && end) opsTransitions[op].maintained++;
         else if (start && !end) opsTransitions[op].regressed++;
         else if (!start && !end) opsTransitions[op].stagnant++;
      });
    }
  });

  return { 
    litTransitions, 
    numTransitions, 
    opsTransitions,
    totalCohort: students.filter(s => s.assessments.length >= 2).length 
  };
}


// -- WRITES --

export async function createStudent(data: {
  name: string;
  classNum: number;
  gender: string;
  schoolId: string;
}) {
  const school = await prisma.school.findUnique({
    where: { id: data.schoolId },
    include: { projectOffice: { include: { division: true } } }
  });

  const divPart = school?.projectOffice.division.name.slice(0, 2).toUpperCase() || 'XX';
  const poPart = school?.projectOffice.name.slice(0, 2).toUpperCase() || 'XX';
  const schPart = school?.name.slice(0, 2).toUpperCase() || 'XX';
  const cleanName = data.name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'STU';
  
  const fullKey = `${school?.name}-${data.classNum}-${data.name}`;
  let hash = 0;
  for (let idx = 0; idx < fullKey.length; idx++) {
    hash = (hash << 5) - hash + fullKey.charCodeAt(idx);
    hash |= 0;
  }
  const hashPartVal = Math.abs(hash).toString(36).toUpperCase().slice(0, 4);
  let uid = `ST-${divPart}${poPart}${schPart}-${data.classNum}-${cleanName}-${hashPartVal}`;

  // Check if UID exists (rare collision safety)
  const existing = await prisma.student.findUnique({ where: { uid } });
  if (existing) {
    uid = `${uid}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const student = await prisma.student.create({
    data: {
      uid,
      name: data.name,
      class: data.classNum,
      gender: data.gender,
      schoolId: data.schoolId,
    }
  });
  
  revalidatePath('/students/new');
  revalidatePath('/', 'layout');
  return student;
}

export async function createAssessment(data: { studentId: string, assessorName: string, literacyLevel: number, numeracyLevel: number, addition?: boolean, subtraction?: boolean, division?: boolean }) {
  const assessment = await prisma.assessment.create({
    data: {
      studentId: data.studentId,
      assessorName: data.assessorName,
      literacyLevel: data.literacyLevel,
      numeracyLevel: data.numeracyLevel,
      addition: data.addition || false,
      subtraction: data.subtraction || false,
      division: data.division || false,
      date: new Date()
    } as any
  });

  revalidatePath('/assessments/new');
  revalidatePath('/', 'layout');
  return assessment;
}

// -- CMS SETTINGS --

export async function getSettings() {
  const records = await (prisma as any).systemSetting.findMany();
  const settings: Record<string, string> = {};
  records.forEach((r: any) => settings[r.key] = r.value);
  return settings;
}

export async function saveSettings(payload: Record<string, string>) {
  for (const [key, value] of Object.entries(payload)) {
    await (prisma as any).systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
}

// -- ADMIN --

async function requireAdmin() {
  const session = await auth();
  if (!hasRole(session, "admin")) throw new Error("Unauthorized");
}

export async function getUsers(): Promise<any[]> {
  await requireAdmin();
  return await (prisma as any).user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { sessions: true } },
      school: { select: { id: true, name: true } },
    },
  });
}

export async function setUserRole(userId: string, role: "user" | "admin" | "state" | "division" | "project_office") {
  await requireAdmin();
  await (prisma as any).user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function assignUserScope(
  userId: string, 
  scopeType: 'school' | 'project_office' | 'division' | null, 
  scopeId: string | null
) {
  await requireAdmin();
  try {
    let updateData: any = {
      schoolId: null,
      projectOfficeId: null,
      divisionId: null
    };

    if (scopeType === 'school' && scopeId) {
      updateData.schoolId = scopeId;
    } else if (scopeType === 'project_office' && scopeId) {
      updateData.projectOfficeId = scopeId;
    } else if (scopeType === 'division' && scopeId) {
      updateData.divisionId = scopeId;
    }

    await (prisma as any).user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (err) {
    console.error("Failed to assign scope", err);
    throw new Error("Failed to assign user scope");
  }
  revalidatePath("/admin/users");
}

export async function getAssessmentsAdmin(page: number = 1, schoolId?: string, term?: string) {
  // We still require admin/some role to access this route, let's keep it open to any logged in user, and scope it.
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const userSchoolId = (session.user as any)?.schoolId;
  const userPOId = (session.user as any)?.projectOfficeId;
  const userDivId = (session.user as any)?.divisionId;

  const take = 50;
  const skip = (page - 1) * take;
  const where: any = {};
  if (term) where.term = term;

  if (userSchoolId) {
    where.student = { schoolId: userSchoolId };
  } else if (userPOId) {
    where.student = { school: { projectOfficeId: userPOId } };
  } else if (userDivId) {
    where.student = { school: { projectOffice: { divisionId: userDivId } } };
  } else if (schoolId) {
    where.student = { schoolId };
  }

  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      orderBy: { date: "desc" },
      take,
      skip,
      include: {
        student: {
          include: { school: { include: { projectOffice: { include: { division: true } } } } }
        }
      }
    }),
    prisma.assessment.count({ where })
  ]);
  return { assessments, total, pages: Math.ceil(total / take) };
}

export async function updateAssessment(id: string, data: {
  assessorName: string;
  literacyLevel: number;
  numeracyLevel: number;
  term: string;
  addition: boolean;
  subtraction: boolean;
  division: boolean;
}) {
  await requireAdmin();
  await prisma.assessment.update({ where: { id }, data });
  revalidatePath('/', 'layout');
}

export async function deleteAssessment(id: string) {
  await requireAdmin();
  await prisma.assessment.delete({ where: { id } });
  revalidatePath('/', 'layout');
}

export async function generateAndSendDeleteOtp() {
  await requireAdmin();
  const session = await auth();
  const email = session?.user?.email;
  
  if (!email) {
    throw new Error("Admin email not found.");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any existing tokens for this action (we use a specific identifier prefix)
  const identifier = `delete_data_${email}`;
  
  try {
    // Upsert token to DB
    await prisma.verificationToken.deleteMany({
      where: { identifier }
    });

    await prisma.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires
      }
    });

    // SIMULATE SENDING EMAIL
    console.log(`\n\n======================================================`);
    console.log(`🔒 ADMIN OTP VERIFICATION`);
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires in: 5 minutes`);
    console.log(`======================================================\n\n`);

    return { success: true };
  } catch (error) {
    console.error("Failed to generate OTP:", error);
    throw new Error("Failed to generate OTP");
  }
}

export async function clearAllAssessments(term?: string, otpCode?: string) {
  await requireAdmin();
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error("Admin email not found.");
  }
  if (!otpCode) {
    throw new Error("OTP verification code is required.");
  }

  const identifier = `delete_data_${email}`;
  
  // Verify OTP
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      token: otpCode
    }
  });

  if (!tokenRecord) {
    throw new Error("Invalid verification code.");
  }

  if (new Date() > tokenRecord.expires) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token: otpCode } }
    });
    throw new Error("Verification code has expired. Please request a new one.");
  }

  // Delete data
  await prisma.assessment.deleteMany(term ? { where: { term } } : undefined);
  
  // Delete the used token so it can't be reused
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token: otpCode } }
  });

  revalidatePath('/', 'layout');
}

export async function clearAllData() {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/data`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Backend clear data failed");
  } catch (err) {
    console.error("Falling back to direct DB clear", err);
    // Fallback to direct DB call
    await prisma.assessment.deleteMany();
    await prisma.student.deleteMany();
    await prisma.school.deleteMany();
    await prisma.projectOffice.deleteMany();
    await prisma.division.deleteMany();
  }
  revalidatePath('/', 'layout');
}

export async function seedHierarchy() {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/upload-data`, { method: 'POST' });
    if (!res.ok) throw new Error("Backend upload data failed");
    const data = await res.json();
    revalidatePath('/', 'layout');
    return { divCount: data.divCount, poCount: data.poCount, schoolCount: data.schoolCount };
  } catch (err) {
    console.error("Falling back to direct DB seed", err);
    
    // Direct DB Fallback
    const { HIERARCHY_DATA } = await import("@/prisma/hierarchy-data");
    let divCount = 0, poCount = 0, schoolCount = 0;
    const existingDivisions = await prisma.division.findMany();
    const existingPOs = await prisma.projectOffice.findMany();
    const existingSchools = await prisma.school.findMany({ select: { udiseCode: true } });
    const divMap = new Map(existingDivisions.map(d => [d.name, d.id]));
    const poMap = new Map(existingPOs.map(p => [`${p.name}__${p.divisionId}`, p.id]));
    const schoolSet = new Set(existingSchools.map(s => s.udiseCode));

    for (const [divName, pos] of Object.entries(HIERARCHY_DATA)) {
      if (!divMap.has(divName)) {
        const div = await prisma.division.create({ data: { name: divName } });
        divMap.set(divName, div.id);
        divCount++;
      }
      const divId = divMap.get(divName)!;

      for (const [poName, schools] of Object.entries(pos as any)) {
        const poKey = `${poName}__${divId}`;
        if (!poMap.has(poKey)) {
          const po = await prisma.projectOffice.create({ data: { name: poName, divisionId: divId } });
          poMap.set(poKey, po.id);
          poCount++;
        }
        const poId = poMap.get(poKey)!;

        const newSchools = (schools as any[]).filter(s => !schoolSet.has(s.udise));
        if (newSchools.length > 0) {
          await prisma.school.createMany({
            data: newSchools.map(s => ({ name: s.name, udiseCode: s.udise, projectOfficeId: poId })),
            skipDuplicates: true,
          });
          newSchools.forEach(s => schoolSet.add(s.udise));
          schoolCount += newSchools.length;
        }
      }
    }
    revalidatePath('/', 'layout');
    return { divCount, poCount, schoolCount };
  }
}

export async function cleanupSchools() {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/schools/cleanup`, { method: 'POST' });
    if (!res.ok) throw new Error("Backend cleanup failed");
    const data = await res.json();
    revalidatePath('/', 'layout');
    return { count: data.count };
  } catch (err) {
    console.error("Falling back to direct DB cleanup", err);
    const { HIERARCHY_DATA } = await import("@/prisma/hierarchy-data");
    const validUdiseCodes = new Set<string>();
    Object.values(HIERARCHY_DATA).forEach((pos: any) => {
      Object.values(pos).forEach((schools: any) => {
        schools.forEach((s: any) => validUdiseCodes.add(s.udise));
      });
    });

    const allSchools = await prisma.school.findMany({ select: { id: true, udiseCode: true } });
    const invalidSchoolIds = allSchools
      .filter(s => !validUdiseCodes.has(s.udiseCode))
      .map(s => s.id);

    if (invalidSchoolIds.length === 0) return { count: 0 };

    await prisma.assessment.deleteMany({ where: { student: { schoolId: { in: invalidSchoolIds } } } });
    await prisma.student.deleteMany({ where: { schoolId: { in: invalidSchoolIds } } });
    const result = await prisma.school.deleteMany({ where: { id: { in: invalidSchoolIds } } });

    revalidatePath('/', 'layout');
    return { count: result.count };
  }
}

// -- SCHOOL LOGINS --

function transliterateDevanagari(str: string): string {
  // Multi-char conjuncts first
  str = str
    .replace(/क्ष/g, 'ksh')
    .replace(/ज्ञ/g, 'dny')
    .replace(/त्र/g, 'tr')
    .replace(/श्र/g, 'shr');

  const consonants: Record<string, string> = {
    'क': 'k',  'ख': 'kh', 'ग': 'g',  'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh','ज': 'j',  'झ': 'jh', 'ञ': 'n',
    'ट': 't',  'ठ': 'th', 'ड': 'd',  'ढ': 'dh', 'ण': 'n',
    'त': 't',  'थ': 'th', 'द': 'd',  'ध': 'dh', 'न': 'n',
    'प': 'p',  'फ': 'ph', 'ब': 'b',  'भ': 'bh', 'म': 'm',
    'य': 'y',  'र': 'r',  'ल': 'l',  'व': 'v',  'श': 'sh',
    'ष': 'sh', 'स': 's',  'ह': 'h',  'ळ': 'l',
  };
  const vowels: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ru', 'ऍ': 'e',
  };
  const matras: Record<string, string | null> = {
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'े': 'e', 'ै': 'ai', 'ो': 'o',  'ौ': 'au', 'ृ': 'ru',
    'ं': 'n', 'ँ': 'n', 'ः': 'h',
    '्': null, // halant — suppress inherent vowel
  };
  const digits: Record<string, string> = {
    '०':'0','१':'1','२':'2','३':'3','४':'4',
    '५':'5','६':'6','७':'7','८':'8','९':'9',
  };

  const chars = [...str];
  let result = '';
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (ch in consonants) {
      result += consonants[ch];
      const nextIsMatra = next !== undefined && next in matras;
      if (!nextIsMatra) result += 'a'; // inherent vowel unless matra/halant follows
    } else if (ch in matras) {
      const v = matras[ch];
      if (v !== null) result += v;
    } else if (ch in vowels) {
      result += vowels[ch];
    } else if (ch in digits) {
      result += digits[ch];
    } else {
      result += ch; // ASCII chars (spaces, hyphens, brackets) pass through
    }
  }
  return result;
}

function toSlug(str: string): string {
  return transliterateDevanagari(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '.');
}

export async function generateSchoolLogins(): Promise<{ created: number; skipped: number }> {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/users/generate-logins`, { method: 'POST' });
    if (!res.ok) throw new Error("Backend generate-logins failed");
    const data = await res.json();
    revalidatePath("/admin/users");
    return { created: data.created, skipped: data.skipped };
  } catch (err) {
    console.error("Falling back to direct DB generation", err);
    
    // Direct DB Fallback
    const DEFAULT_PASSWORD = "Pratham@2025";
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const schools = await prisma.school.findMany({ include: { projectOffice: true } });
    const data = schools.map(school => ({
      email: `${toSlug(school.projectOffice.name)}.${toSlug(school.name)}@flnhub.in`,
      name: school.name,
      role: "user",
      schoolId: school.id,
      passwordHash,
    }));
    const result = await (prisma as any).user.createMany({ data, skipDuplicates: true });
    revalidatePath("/admin/users");
    return { created: result.count, skipped: schools.length - result.count };
  }
}

export async function deleteSchoolLogins(ids: string[]): Promise<{ deleted: number }> {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/users/logins`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error("Backend delete logins failed");
    const data = await res.json();
    revalidatePath('/admin/logins');
    return { deleted: data.deleted };
  } catch (err) {
    console.error("Falling back to direct DB", err);
    const result = await (prisma as any).user.deleteMany({
      where: { id: { in: ids }, email: { endsWith: '@flnhub.in' } },
    });
    revalidatePath('/admin/logins');
    return { deleted: result.count };
  }
}

export async function getSchoolCredentials(): Promise<{ id: string; school: string; po: string; email: string; password: string; role: string; locationLevel: string }[]> {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/users/credentials`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error("Backend get credentials failed");
    return await res.json();
  } catch (err) {
    console.error("Falling back to direct DB", err);
    const users = await (prisma as any).user.findMany({
      where: { passwordHash: { not: null } },
      include: { 
        school: { include: { projectOffice: true } },
        projectOffice: true,
        division: true
      },
      orderBy: { email: 'asc' },
    });

    return users.map((u: any) => {
      let locationLevel = "State";
      if (u.school) locationLevel = `School: ${u.school.name}`;
      else if (u.projectOffice) locationLevel = `PO: ${u.projectOffice.name}`;
      else if (u.division) locationLevel = `Div: ${u.division.name}`;

      return {
        id: u.id,
        po: u.school?.projectOffice?.name ?? u.projectOffice?.name ?? u.division?.name ?? 'State',
        school: u.school?.name ?? 'N/A',
        email: u.email,
        password: 'Pratham@2025',
        role: u.role,
        locationLevel
      };
    });
  }
}

export async function createCustomLogin(data: {
  email: string;
  password: string;
  role: string;
  level: "state" | "division" | "project_office" | "school";
  targetId?: string;
}): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/users/custom-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errRes = await res.json();
      return { error: errRes.error || "Backend failed" };
    }
    revalidatePath('/admin/logins');
    return {};
  } catch (err) {
    console.error("Falling back to direct DB create login", err);
    const trimmedEmail = data.email.trim().toLowerCase();
    if (!trimmedEmail) return { error: "Email cannot be empty" };
    const existing = await (prisma as any).user.findUnique({ where: { email: trimmedEmail } });
    if (existing) return { error: "Email already in use" };
    const passwordHash = await bcrypt.hash(data.password, 10);
    const userData: any = {
      email: trimmedEmail,
      name: "Custom Login",
      role: data.role,
      passwordHash,
    };
    if (data.level === "school" && data.targetId) userData.schoolId = data.targetId;
    else if (data.level === "project_office" && data.targetId) userData.projectOfficeId = data.targetId;
    else if (data.level === "division" && data.targetId) userData.divisionId = data.targetId;
    await (prisma as any).user.create({ data: userData });
    revalidatePath('/admin/logins');
    return {};
  }
}

export async function updateLoginEmail(userId: string, newEmail: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/users/email`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newEmail })
    });
    if (!res.ok) {
      const errRes = await res.json();
      return { error: errRes.error || "Backend failed" };
    }
    revalidatePath('/admin/logins');
    return {};
  } catch (err) {
    console.error("Falling back to direct DB update email", err);
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return { error: 'Email cannot be empty' };
    const existing = await (prisma as any).user.findUnique({ where: { email: trimmed } });
    if (existing && existing.id !== userId) return { error: 'Email already in use' };
    await (prisma as any).user.update({ where: { id: userId }, data: { email: trimmed } });
    revalidatePath('/admin/logins');
    return {};
  }
}

// -- BATTLE MATCHMAKER --

export type MatchCandidate = { id: string; name: string; class: number; gender: string };

export async function getMatchCandidates(
  schoolId: string,
  classNum: number,
  subject: 'literacy' | 'numeracy',
  level: number
): Promise<MatchCandidate[]> {
  const students = await prisma.student.findMany({
    where: { schoolId, class: classNum },
    include: { assessments: { orderBy: { date: 'desc' }, take: 1 } },
  });

  return students
    .filter(s => {
      const latest = s.assessments[0];
      if (!latest) return false;
      if (subject === 'literacy') {
        return latest.literacyLevel === level;
      } else {
        // UI levels: 0: Beginner, 1: 1-9, 2: 10-99, 3: Addition, 4: Subtraction, 5: Division
        // DB levels: 0: Beginner, 1: 1-9, 2: 10-99, 3: Addition, 4: Subtraction, 5: Multiplication, 6: Division
        const dbLevel = latest.numeracyLevel;
        if (level === 5) {
          return dbLevel === 6;
        } else if (level === 4) {
          return dbLevel === 4 || dbLevel === 5;
        } else {
          return dbLevel === level;
        }
      }
    })
    .map(s => ({ id: s.id, name: s.name, class: s.class, gender: s.gender }));
}

export async function recordBattleResult(data: {
  schoolId: string;
  classNum: number;
  subject: string;
  level: number;
  gameSlug: string;
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
}): Promise<void> {
  // Skip recording for guest sessions
  if (data.schoolId === 'guest-school' || data.player1Id.startsWith('guest-')) {
    console.log("Skipping recordBattleResult for guest session");
    return;
  }

  // @ts-ignore - Prisma client needs local generation
  await prisma.battleRecord.create({ data });
  
  // Increment gamesPlayed for both players
  // @ts-ignore
  await prisma.student.update({
    where: { id: data.player1Id },
    data: { gamesPlayed: { increment: 1 } }
  });
  // @ts-ignore
  await prisma.student.update({
    where: { id: data.player2Id },
    data: { gamesPlayed: { increment: 1 } }
  });

  revalidatePath('/dashboard');
}

export async function getStrugglingStudents(schoolId: string, classNum?: number | 'all') {
  const where: any = { schoolId };
  if (classNum && classNum !== 'all') {
    where.class = Number(classNum);
  }
  const students = await prisma.student.findMany({
    where,
    include: { assessments: { orderBy: { date: 'asc' } } },
  });

  return students
    .filter(s => {
      const assessments = s.assessments;
      if (assessments.length < 2) return false;
      const baseline = assessments[0];
      const latest = assessments[assessments.length - 1];
      // Struggling if latest level is not higher than baseline AND the level is low
      const noProgress = latest.literacyLevel <= baseline.literacyLevel && latest.numeracyLevel <= baseline.numeracyLevel;
      const isLowLevel = latest.literacyLevel < 3 || latest.numeracyLevel < 3;
      return noProgress && isLowLevel;
    })
    .map(s => {
      const latest = s.assessments[s.assessments.length - 1];
      return {
        id: s.id,
        name: s.name,
        latestLevel: latest.literacyLevel,
        baselineLevel: s.assessments[0].literacyLevel
      };
    });
}

export async function getGrowthVelocity(filters: { divisionId?: string, projectOfficeId?: string, schoolId?: string, classNum?: number | 'all' } = {}) {
  const session = await auth();
  const userSchoolId = (session?.user as any)?.schoolId;
  const userPOId = (session?.user as any)?.projectOfficeId;
  const userDivId = (session?.user as any)?.divisionId;

  const whereFilter: any = {};
  if (userSchoolId) {
    whereFilter.schoolId = userSchoolId;
  } else if (userPOId) {
    whereFilter.school = { projectOfficeId: userPOId };
  } else if (userDivId) {
    whereFilter.school = { projectOffice: { divisionId: userDivId } };
  } else {
    // Admin filters
    if (filters.schoolId) {
      whereFilter.schoolId = filters.schoolId;
    } else if (filters.projectOfficeId) {
      whereFilter.school = { projectOfficeId: filters.projectOfficeId };
    } else if (filters.divisionId) {
      whereFilter.school = { projectOffice: { divisionId: filters.divisionId } };
    }
  }

  // Respect the class filter if specified; default to Grade 4 only
  if (filters.classNum && filters.classNum !== 'all') {
    whereFilter.class = Number(filters.classNum);
  } else {
    whereFilter.class = 4;
  }

  const students = await prisma.student.findMany({
    where: whereFilter,
    include: { assessments: { where: { term: 'Endline' }, orderBy: { date: 'desc' } } },
  });

  let storyCount = 0;
  let divisionCount = 0;
  let totalAssessed = 0;

  students.forEach(s => {
    if (s.assessments.length > 0) {
      totalAssessed++;
      const latest = s.assessments[0];
      
      // Determine targets dynamically based on student's class (NIPUN Bharat targets)
      let targetLit = 4; // Default/Grade 2+ target: Story (Level 4)
      let targetNum = 6; // Default/Grade 3+ target: Division (Level 6 in DB)
      
      if (s.class === 1) {
        targetLit = 3; // Paragraph (Level 3)
        targetNum = 3; // Addition (Level 3 in DB)
      } else if (s.class === 2) {
        targetLit = 4; // Story (Level 4)
        targetNum = 4; // Subtraction (Level 4 in DB)
      }
      
      const canReadStory = latest.literacyLevel >= targetLit;
      const canDoDivision = latest.division === true || latest.numeracyLevel >= targetNum;
      
      if (canReadStory) {
        storyCount++;
      }
      if (canDoDivision) {
        divisionCount++;
      }
    }
  });

  return {
    totalMeasured: totalAssessed,
    literacyScore: totalAssessed > 0 ? Math.round((storyCount / totalAssessed) * 100) : 0,
    numeracyScore: totalAssessed > 0 ? Math.round((divisionCount / totalAssessed) * 100) : 0,
  };
}
export async function getInterventionPlan(students: any[]) {
  // In a real app, this would call an LLM. Here we provide a structured pedagogical response.
  const levels = Array.from(new Set(students.map(s => s.latestLevel)));
  const avgLevel = levels.length > 0 ? labels[Math.floor(levels.reduce((a, b) => a + b, 0) / levels.length)] : "Beginner";

  return {
    title: `10-Day Intensive Bootcamp: Stage ${avgLevel}`,
    focus: "Bridging the gap between recognition and phonetic assembly.",
    schedule: [
      { day: "1-2", activity: "Phonetic Flashcards & Mirror Practice (अ, आ, इ, ई)" },
      { day: "3-5", activity: "Interactive 'Word Race' simulations in pairs" },
      { day: "6-8", activity: "Sentence Architect challenges with Emoji-to-Marathi" },
      { day: "9-10", activity: "Peer-to-peer 2v2 Battles with teacher observation" }
    ],
    resources: ["Letter Identification Tool", "Marathi Word Cards", "FLN Battle Arena"]
  };
}

export async function getPORankings(divisionId?: string, classNum?: number | 'all') {
  const where: any = {};
  if (divisionId) where.divisionId = divisionId;

  const studentWhere: any = {};
  if (classNum && classNum !== 'all') {
    studentWhere.class = Number(classNum);
  }

  const pos = await prisma.projectOffice.findMany({
    where,
    include: {
      schools: {
        include: {
          students: {
            where: studentWhere,
            include: {
              assessments: {
                where: { term: 'Endline' },
                orderBy: { date: 'desc' },
                take: 1
              }
            }
          }
        }
      }
    }
  });

  const rankings = pos.map(po => {
    let totalAssessed = 0;
    let storyReaders = 0;
    let subtractionMasters = 0;

    po.schools.forEach(school => {
      school.students.forEach(student => {
        const latest = student.assessments[0];
        if (latest) {
          totalAssessed++;
          if (latest.literacyLevel === 4) storyReaders++;
          if (latest.subtraction === true || latest.numeracyLevel >= 4) subtractionMasters++;
        }
      });
    });

    return {
      id: po.id,
      name: po.name,
      totalAssessed,
      storyPct: totalAssessed > 0 ? Math.round((storyReaders / totalAssessed) * 100) : 0,
      subtractionPct: totalAssessed > 0 ? Math.round((subtractionMasters / totalAssessed) * 100) : 0,
      score: totalAssessed > 0 ? Math.round(((storyReaders + subtractionMasters) / (totalAssessed * 2)) * 100) : 0
    };
  });

  return rankings.sort((a, b) => b.score - a.score);
}

export async function getClassStats(schoolId: string, classNum: number) {
  const students = await prisma.student.findMany({
    where: { schoolId, class: classNum },
    include: { assessments: { orderBy: { date: 'desc' }, take: 1 } },
  });

  if (students.length === 0) return { avgLevel: 0, majorityLevel: 0, total: 0 };

  const levels = students.map(s => s.assessments[0]?.literacyLevel ?? 0);
  const majorityLevel = levels.sort((a,b) =>
    levels.filter(v => v===a).length - levels.filter(v => v===b).length
  ).pop() ?? 0;

  return {
    majorityLevel,
    avgLevel: Math.round(levels.reduce((a, b) => a + b, 0) / levels.length),
    total: students.length
  };
}

const labels = ['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'];

export async function recordSingleGameResult(data: {
  schoolId: string;
  studentId: string;
  gameSlug: string;
  score: number;
  duration: number;
}) {
  try {
    const record = await prisma.singleGameRecord.create({
      data: {
        schoolId: data.schoolId,
        studentId: data.studentId,
        gameSlug: data.gameSlug,
        score: data.score,
        duration: data.duration,
      }
    });

    await prisma.student.update({
      where: { id: data.studentId },
      data: {
        gamesPlayed: { increment: 1 }
      }
    });

    revalidatePath(`/students/${data.studentId}`);
    return { success: true, record };
  } catch (error) {
    console.error("Failed to record single game:", error);
    return { success: false, error: "Failed to save record" };
  }
}

export async function getStudentLeaderboard(filters: {
  divisionId?: string;
  projectOfficeId?: string;
  schoolId?: string;
  classNum?: number | 'all';
  sortBy?: 'best' | 'help';
} = {}) {
  const session = await auth();
  const userSchoolId = (session?.user as any)?.schoolId;
  const userPOId = (session?.user as any)?.projectOfficeId;
  const userDivId = (session?.user as any)?.divisionId;

  const whereFilter: any = {};
  if (userSchoolId) {
    whereFilter.schoolId = userSchoolId;
  } else if (userPOId) {
    whereFilter.school = { projectOfficeId: userPOId };
  } else if (userDivId) {
    whereFilter.school = { projectOffice: { divisionId: userDivId } };
  } else {
    // Admin/State filters
    if (filters.schoolId) {
      whereFilter.schoolId = filters.schoolId;
    } else if (filters.projectOfficeId) {
      whereFilter.school = { projectOfficeId: filters.projectOfficeId };
    } else if (filters.divisionId) {
      whereFilter.school = { projectOffice: { divisionId: filters.divisionId } };
    }
  }

  if (filters.classNum && filters.classNum !== 'all') {
    whereFilter.class = Number(filters.classNum);
  }

  const students = await prisma.student.findMany({
    where: whereFilter,
    include: {
      school: {
        include: {
          projectOffice: {
            include: { division: true }
          }
        }
      },
      assessments: {
        orderBy: { date: 'desc' },
        take: 1
      },
      _count: {
        select: {
          battlesWon: true,
          singleGames: true,
          battlesAsP1: true,
          battlesAsP2: true
        }
      }
    }
  });

  const leaderboard = students.map(student => {
    const latestAssessment = student.assessments[0];
    const litLevel = latestAssessment?.literacyLevel ?? 0;
    const numLevel = latestAssessment?.numeracyLevel ?? 0;
    
    // FLN Level score: dynamically calculated out of 200 (100 for literacy, 100 for numeracy) based on target schemas
    let litMarks = 0;
    if (student.class === 1) {
      // Class 1 target: Paragraph (Level 3)
      if (litLevel >= 3) {
        litMarks = 100;
      } else {
        litMarks = Math.round((litLevel / 3) * 100);
      }
    } else {
      // Class 2+ target: Story (Level 4)
      if (litLevel >= 4) {
        litMarks = 100;
      } else {
        litMarks = Math.round((litLevel / 4) * 100);
      }
    }

    let numMarks = 0;
    if (student.class === 1) {
      // Class 1 target: Addition (Level 3 in DB)
      if (numLevel >= 3) {
        numMarks = 100;
      } else {
        numMarks = Math.round((numLevel / 3) * 100);
      }
    } else if (student.class === 2) {
      // Class 2 target: Subtraction (Level 4 in DB)
      if (numLevel >= 4) {
        numMarks = 100;
      } else {
        numMarks = Math.round((numLevel / 4) * 100);
      }
    } else {
      // Class 3+ target: Division (Level 6 in DB)
      if (numLevel >= 6 || latestAssessment?.division === true) {
        numMarks = 100;
      } else {
        numMarks = Math.round((numLevel / 6) * 100);
      }
    }

    const flnScore = litMarks + numMarks;
    
    const battlesCount = student._count.battlesAsP1 + student._count.battlesAsP2;
    const singleGamesCount = student._count.singleGames;
    const totalGamesPlayed = student.gamesPlayed || (battlesCount + singleGamesCount);
    
    // Engagement score: 5 points per game played
    const engagementScore = totalGamesPlayed * 5;
    
    // Victory bonus: 10 points per battle won
    const victories = student._count.battlesWon;
    const victoryBonus = victories * 10;
    
    const totalScore = flnScore + engagementScore + victoryBonus;

    return {
      id: student.id,
      uid: student.uid,
      name: student.name,
      classNum: student.class,
      schoolName: student.school.name,
      poName: student.school.projectOffice.name,
      divName: student.school.projectOffice.division.name,
      litLevel,
      numLevel,
      gamesPlayed: totalGamesPlayed,
      victories,
      flnScore,
      engagementScore,
      victoryBonus,
      totalScore
    };
  });

  const isHelp = filters.sortBy === 'help';
  // Sort by totalScore desc (or asc if sortBy is 'help'), then by name asc
  return leaderboard
    .sort((a, b) => isHelp
      ? a.totalScore - b.totalScore || a.name.localeCompare(b.name)
      : b.totalScore - a.totalScore || a.name.localeCompare(b.name)
    )
    .slice(0, 100); // return top 100
}

const getEditDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
};

const deduplicateStudents = (students: any[]) => {
  const uniqueStudents: any[] = [];
  students.forEach(s => {
    const latest = s.assessments[0];
    if (!latest) return;
    const score = (latest.literacyLevel || 0) + (latest.numeracyLevel || 0);
    const normName = s.name.replace(/\s+/g, '').toLowerCase();
    
    const existing = uniqueStudents.find(us => {
      if (us.s.class !== s.class) return false;
      const usNorm = us.s.name.replace(/\s+/g, '').toLowerCase();
      if (usNorm === normName) return true;
      const dist = getEditDistance(usNorm, normName);
      const maxLen = Math.max(usNorm.length, normName.length);
      return dist <= Math.floor(maxLen / 4) && maxLen > 5;
    });

    if (!existing) {
      uniqueStudents.push({ s, score });
    } else {
      if (score > existing.score) {
        existing.s = s;
        existing.score = score;
      }
    }
  });
  return uniqueStudents.map(us => us.s);
};

export async function getSchoolRankings(divisionId?: string, projectOfficeId?: string, classNum?: number | 'all') {
  const where: any = {};
  if (divisionId) where.projectOffice = { divisionId };
  if (projectOfficeId) where.projectOfficeId = projectOfficeId;

  const studentWhere: any = {};
  if (classNum && classNum !== 'all') {
    studentWhere.class = Number(classNum);
  }

  const schools = await prisma.school.findMany({
    where,
    include: {
      projectOffice: {
        include: {
          division: true
        }
      },
      students: {
        where: studentWhere,
        include: {
          assessments: {
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  const rankings = schools.map(school => {
    let totalAssessed = 0;
    let storyReaders = 0;
    let subtractionMasters = 0;

    const uniqueStudents = deduplicateStudents(school.students);

    uniqueStudents.forEach(student => {
      const latest = student.assessments[0];
      if (latest) {
        totalAssessed++;
        if (latest.literacyLevel === 4) storyReaders++;
        if (latest.subtraction === true || latest.numeracyLevel >= 4) subtractionMasters++;
      }
    });

    return {
      id: school.id,
      name: school.name,
      udiseCode: school.udiseCode,
      poName: school.projectOffice.name,
      divName: school.projectOffice.division.name,
      totalAssessed,
      storyPct: totalAssessed > 0 ? Math.round((storyReaders / totalAssessed) * 100) : 0,
      subtractionPct: totalAssessed > 0 ? Math.round((subtractionMasters / totalAssessed) * 100) : 0,
      score: totalAssessed > 0 ? Math.round(((storyReaders + subtractionMasters) / (totalAssessed * 2)) * 100) : 0
    };
  });

  return rankings.sort((a, b) => b.score - a.score);
}

export async function getSchoolStudentsDetails(schoolId: string, classNum?: number | 'all') {
  const where: any = { schoolId };
  if (classNum && classNum !== 'all') {
    where.class = Number(classNum);
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      assessments: {
        orderBy: { date: 'desc' },
        take: 1
      }
    },
    orderBy: { name: 'asc' }
  });

  // Deduplicate students by name and class (in case previous upload logic created duplicate records)
  // We use Levenshtein distance to catch minor spelling typos (e.g. Marathi names with/without anusvara)
  const uniqueStudentsList = deduplicateStudents(students);

  return uniqueStudentsList.map((s: any) => {
    const latest = s.assessments[0];
    return {
      id: s.id,
      name: s.name,
      classNum: s.class,
      litLevel: latest?.literacyLevel ?? 0,
      numLevel: latest?.numeracyLevel ?? 0,
    };
  });
}
