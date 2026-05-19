import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

async function main() {
  console.log('Fetching all students and their hierarchy...');
  const students = await prisma.student.findMany({
    include: {
      school: {
        include: {
          projectOffice: {
            include: {
              division: true
            }
          }
        }
      }
    }
  });

  console.log(`Total students in database before deduplication: ${students.length}`);

  // Group by schoolId + normalized name + class
  const groups = new Map<string, typeof students>();
  students.forEach(st => {
    const key = `${st.schoolId}-${normalize(st.name)}-${st.class}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(st);
  });

  console.log('Processing duplicates in memory...');
  const dupMappings: { dupId: string; keptId: string }[] = [];
  const toDeleteIds: string[] = [];

  for (const [key, list] of groups.entries()) {
    const keptStudent = list[0];
    const duplicates = list.slice(1);

    if (duplicates.length > 0) {
      duplicates.forEach(d => {
        dupMappings.push({ dupId: d.id, keptId: keptStudent.id });
        toDeleteIds.push(d.id);
      });
    }
  }

  console.log(`Found ${dupMappings.length} duplicates to merge.`);

  if (dupMappings.length > 0) {
    console.log('Bulk re-linking assessments in Postgres...');
    for (let i = 0; i < dupMappings.length; i += 1000) {
      const chunk = dupMappings.slice(i, i + 1000);
      const sqlValues = chunk.map(x => `('${x.dupId}', '${x.keptId}')`).join(',');
      
      await prisma.$executeRawUnsafe(`
        UPDATE "Assessment" SET "studentId" = vals.keptId
        FROM (VALUES ${sqlValues}) AS vals(dupId, keptId)
        WHERE "studentId" = vals.dupId;
      `);
    }

    console.log('Bulk re-linking battle records (Player 1) in Postgres...');
    for (let i = 0; i < dupMappings.length; i += 1000) {
      const chunk = dupMappings.slice(i, i + 1000);
      const sqlValues = chunk.map(x => `('${x.dupId}', '${x.keptId}')`).join(',');
      
      await prisma.$executeRawUnsafe(`
        UPDATE "BattleRecord" SET "player1Id" = vals.keptId
        FROM (VALUES ${sqlValues}) AS vals(dupId, keptId)
        WHERE "player1Id" = vals.dupId;
      `);
    }

    console.log('Bulk re-linking battle records (Player 2) in Postgres...');
    for (let i = 0; i < dupMappings.length; i += 1000) {
      const chunk = dupMappings.slice(i, i + 1000);
      const sqlValues = chunk.map(x => `('${x.dupId}', '${x.keptId}')`).join(',');
      
      await prisma.$executeRawUnsafe(`
        UPDATE "BattleRecord" SET "player2Id" = vals.keptId
        FROM (VALUES ${sqlValues}) AS vals(dupId, keptId)
        WHERE "player2Id" = vals.dupId;
      `);
    }

    console.log('Bulk re-linking battle records (Winner) in Postgres...');
    for (let i = 0; i < dupMappings.length; i += 1000) {
      const chunk = dupMappings.slice(i, i + 1000);
      const sqlValues = chunk.map(x => `('${x.dupId}', '${x.keptId}')`).join(',');
      
      await prisma.$executeRawUnsafe(`
        UPDATE "BattleRecord" SET "winnerId" = vals.keptId
        FROM (VALUES ${sqlValues}) AS vals(dupId, keptId)
        WHERE "winnerId" = vals.dupId;
      `);
    }

    console.log('Deleting duplicate student records...');
    for (let i = 0; i < toDeleteIds.length; i += 1000) {
      const chunk = toDeleteIds.slice(i, i + 1000);
      await prisma.student.deleteMany({
        where: { id: { in: chunk } }
      });
    }
  }

  // Reload the clean list of unique students to assign UIDs
  console.log('Reloading unique students...');
  const cleanStudents = await prisma.student.findMany({
    include: {
      school: {
        include: {
          projectOffice: {
            include: {
              division: true
            }
          }
        }
      }
    }
  });

  console.log(`Clean unique students to update: ${cleanStudents.length}`);

  const uniqueUids = new Set<string>();
  const updates: { id: string; uid: string }[] = [];

  cleanStudents.forEach(student => {
    const sch = student.school;
    const divPart = sch.projectOffice.division.name.slice(0, 2).toUpperCase() || 'XX';
    const poPart = sch.projectOffice.name.slice(0, 2).toUpperCase() || 'XX';
    const schPart = sch.name.slice(0, 2).toUpperCase() || 'XX';
    const cleanName = student.name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3) || 'STU';
    
    const fullKey = `${sch.name}-${student.class}-${student.name}`;
    let hash = 0;
    for (let idx = 0; idx < fullKey.length; idx++) {
      hash = (hash << 5) - hash + fullKey.charCodeAt(idx);
      hash |= 0;
    }
    let hashPartVal = Math.abs(hash).toString(36).toUpperCase().slice(0, 4);
    let uid = `ST-${divPart}${poPart}${schPart}-${student.class}-${cleanName}-${hashPartVal}`;
    
    let suffix = 1;
    while (uniqueUids.has(uid)) {
      uid = `ST-${divPart}${poPart}${schPart}-${student.class}-${cleanName}-${hashPartVal}-${suffix}`;
      suffix++;
    }
    uniqueUids.add(uid);

    updates.push({ id: student.id, uid });
  });

  console.log(`Performing bulk UID updates in batches of 1000...`);
  for (let i = 0; i < updates.length; i += 1000) {
    const chunk = updates.slice(i, i + 1000);
    const sqlValues = chunk.map(x => `('${x.id}', '${x.uid}')`).join(',');
    
    await prisma.$executeRawUnsafe(`
      UPDATE "Student" AS s SET
        uid = vals.uid
      FROM (VALUES ${sqlValues}) AS vals(id, uid)
      WHERE s.id = vals.id;
    `);
    console.log(`Updated batch ${i / 1000 + 1}/${Math.ceil(updates.length / 1000)}`);
  }

  console.log('\nOptimization completed successfully!');
  const finalCount = await prisma.student.count();
  console.log(`Final total student count: ${finalCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
