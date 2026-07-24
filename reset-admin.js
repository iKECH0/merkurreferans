const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Yönetici',
      role: 'ADMIN',
      phone: '0000000000'
    }
  });
  
  console.log('Admin password reset to 123456');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
