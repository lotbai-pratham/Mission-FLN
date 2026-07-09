// scripts/checkSchoolDb.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany({
    take: 5,
    include: { projectOffice: { include: { division: true } } }
  });
  console.log('Sample Schools in Database:');
  console.log(JSON.stringify(schools, null, 2));
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
