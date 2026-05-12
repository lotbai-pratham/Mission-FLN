const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@flnhub.in';
  const password = 'Admin@2025';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      passwordHash,
      role: 'admin'
    },
    create: {
      email,
      name: 'Admin',
      role: 'admin',
      passwordHash,
    },
  });

  console.log('✅ Admin password has been reset!');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 New Password: ${password}`);
  
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
