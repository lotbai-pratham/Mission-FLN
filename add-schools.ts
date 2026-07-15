import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const posToUpdate = ['पुसद', 'डहाणू', 'पेण'];
  let added = 0;
  
  for (const poName of posToUpdate) {
    const po = await prisma.projectOffice.findFirst({ where: { name: poName } });
    if (po) {
      const existing = await prisma.school.findFirst({ where: { name: `Mock School ${poName}` }});
      if (!existing) {
        await prisma.school.create({
          data: {
            name: `Mock School ${poName}`,
            udiseCode: `MOCK${Date.now().toString().slice(-6)}${added}`,
            projectOfficeId: po.id
          }
        });
        added++;
        console.log(`Added school to ${poName}`);
      } else {
        console.log(`School already exists in ${poName}`);
      }
    } else {
      console.log(`PO ${poName} not found`);
    }
  }
  
  const count = await prisma.school.count();
  console.log(`Total schools now: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
