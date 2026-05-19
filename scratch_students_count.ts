import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allStudents = await prisma.student.count();
  const studentsWithAssessments = await prisma.student.count({
    where: {
      assessments: {
        some: {}
      }
    }
  });

  const baselineStudents = await prisma.student.count({
    where: {
      assessments: {
        some: { term: 'Baseline' }
      }
    }
  });

  const midlineStudents = await prisma.student.count({
    where: {
      assessments: {
        some: { term: 'Midline' }
      }
    }
  });

  const endlineStudents = await prisma.student.count({
    where: {
      assessments: {
        some: { term: 'Endline' }
      }
    }
  });

  console.log(`Total students in DB: ${allStudents}`);
  console.log(`Students with at least one assessment: ${studentsWithAssessments}`);
  console.log(`Students with Baseline assessment: ${baselineStudents}`);
  console.log(`Students with Midline assessment: ${midlineStudents}`);
  console.log(`Students with Endline assessment: ${endlineStudents}`);
}

main().finally(() => prisma.$disconnect());
