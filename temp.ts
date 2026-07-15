import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const pos = await prisma.projectOffice.findMany();
  console.log('Project Offices:', pos.map(p => p.name).join(', '));
  const schools = await prisma.school.count();
  console.log('Schools:', schools);

  const pusadPO = await prisma.projectOffice.findFirst({ where: { name: { contains: 'Pusad', mode: 'insensitive' } } });
  const dahanuPO = await prisma.projectOffice.findFirst({ where: { name: { contains: 'dahanu', mode: 'insensitive' } } });
  const penPO = await prisma.projectOffice.findFirst({ where: { name: { contains: 'pen', mode: 'insensitive' } } });
  
  console.log('Found POs:', { 
    pusad: pusadPO?.name, 
    dahanu: dahanuPO?.name, 
    pen: penPO?.name 
  });
}
main().finally(() => prisma.$disconnect());
