import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.update({where: {email: "shubhendu@flnhub.in"}, data: {role: "state"}});
  console.log(user);
}
main().finally(() => prisma.$disconnect());
