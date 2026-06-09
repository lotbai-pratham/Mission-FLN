// scripts/updateSchoolUdise.ts
import { PrismaClient } from '@prisma/client';
import { schoolsFromCsv } from '../prisma/schoolsFromCsv.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting UDISE code update for existing schools...');
  
  // Create a map for quick lookup
  const udiseMap = new Map<string, string>();
  for (const item of schoolsFromCsv) {
    udiseMap.set(item.name.trim(), item.udise.trim());
  }

  // Fetch all schools from the database
  const schools = await prisma.school.findMany();
  console.log(`Found ${schools.length} schools in the database.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const school of schools) {
    const correctUdise = udiseMap.get(school.name.trim());
    if (correctUdise) {
      if (school.udiseCode !== correctUdise) {
        try {
          await prisma.school.update({
            where: { id: school.id },
            data: { udiseCode: correctUdise }
          });
          console.log(`Updated school "${school.name}": ${school.udiseCode} -> ${correctUdise}`);
          updatedCount++;
        } catch (err) {
          console.error(`Failed to update school "${school.name}" to ${correctUdise}:`, err);
        }
      } else {
        skippedCount++;
      }
    } else {
      console.log(`No matching UDISE found in XLSX for school "${school.name}"`);
    }
  }

  console.log(`UDISE update complete! Updated: ${updatedCount}, Skipped (already matching): ${skippedCount}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
