import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting optimized assessment deduplication...");

  // 1. Group assessments by studentId and term to find duplicates
  const duplicates = await prisma.assessment.groupBy({
    by: ['studentId', 'term'],
    _count: {
      id: true
    },
    having: {
      studentId: {
        _count: {
          gt: 1
        }
      }
    }
  });

  if (duplicates.length === 0) {
    console.log("No duplicate assessments found.");
    return;
  }

  console.log(`Found ${duplicates.length} student-term pairs with duplicate assessments.`);

  // Extract student IDs to fetch all related assessments in bulk
  const studentIds = Array.from(new Set(duplicates.map(d => d.studentId)));

  // Fetch all assessments for these students
  const allAssessments = await prisma.assessment.findMany({
    where: {
      studentId: {
        in: studentIds
      }
    }
  });

  // Group by studentId and term in memory
  const groups: Record<string, typeof allAssessments> = {};
  for (const a of allAssessments) {
    const key = `${a.studentId}-${a.term.toLowerCase()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }

  const deleteIds: string[] = [];

  for (const dup of duplicates) {
    const key = `${dup.studentId}-${dup.term.toLowerCase()}`;
    const assessments = groups[key];
    if (!assessments || assessments.length <= 1) continue;

    let keptId = assessments[0].id;
    const termLower = dup.term.toLowerCase();

    if (termLower.includes('baseline')) {
      // Keep lowest level (literacyLevel + numeracyLevel)
      assessments.sort((a, b) => {
        const sumA = a.literacyLevel + a.numeracyLevel;
        const sumB = b.literacyLevel + b.numeracyLevel;
        if (sumA !== sumB) return sumA - sumB;
        return a.date.getTime() - b.date.getTime(); // Tie breaker: oldest first
      });
      keptId = assessments[0].id;
    } else if (termLower.includes('endline')) {
      // Keep highest level
      assessments.sort((a, b) => {
        const sumA = a.literacyLevel + a.numeracyLevel;
        const sumB = b.literacyLevel + b.numeracyLevel;
        if (sumA !== sumB) return sumB - sumA;
        return b.date.getTime() - a.date.getTime(); // Tie breaker: newest first
      });
      keptId = assessments[0].id;
    } else {
      // Midline (or other): keep closest to average
      const count = assessments.length;
      const avgLit = assessments.reduce((sum, a) => sum + a.literacyLevel, 0) / count;
      const avgNum = assessments.reduce((sum, a) => sum + a.numeracyLevel, 0) / count;

      let minDistance = Infinity;
      
      for (const a of assessments) {
        const dist = Math.abs(a.literacyLevel - avgLit) + Math.abs(a.numeracyLevel - avgNum);
        if (dist < minDistance) {
          minDistance = dist;
          keptId = a.id;
        }
      }
    }

    // Mark others for deletion
    for (const a of assessments) {
      if (a.id !== keptId) {
        deleteIds.push(a.id);
      }
    }
  }

  console.log(`Deleting ${deleteIds.length} duplicate assessments in bulk...`);

  if (deleteIds.length > 0) {
    const chunk = 500;
    for (let i = 0; i < deleteIds.length; i += chunk) {
      const ids = deleteIds.slice(i, i + chunk);
      await prisma.assessment.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });
    }
  }

  console.log(`Deduplication completed. Deleted ${deleteIds.length} duplicate assessment records.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
