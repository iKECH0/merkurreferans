import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const rootUser = await prisma.user.findFirst({ where: { username: 'test' } });
  
  if (!rootUser) {
    console.error("Root user 'test' not found");
    return;
  }

  console.log("Seeding network for user:", rootUser.name);

  // Clear existing mock network (optional, to keep it clean)
  await prisma.user.deleteMany({
    where: { username: { startsWith: 'mock_' } }
  });

  const password = await bcrypt.hash('123456', 10);
  const roles = ['TEACHER', 'PARENT'];

  // Level 1: 3 Referrers directly under 'test'
  const level1 = [];
  for(let i=1; i<=3; i++) {
    const u = await prisma.user.create({
      data: {
        name: `Ahmet ${i}. Kademe`,
        username: `mock_ahmet_${i}`,
        password,
        role: roles[i % 2],
        referralCode: `MOCKA${i}`,
        referrerId: rootUser.id,
        isActive: true
      }
    });
    level1.push(u);
  }

  // Level 2: 2 Referrers under each Level 1
  const level2 = [];
  for(let parent of level1) {
    for(let i=1; i<=2; i++) {
      const u = await prisma.user.create({
        data: {
          name: `Ayşe 2. Kademe (Sponsor: ${parent.name.split(' ')[0]})`,
          username: `mock_ayse_${parent.id.slice(-4)}_${i}`,
          password,
          role: roles[i % 2],
          referralCode: `MOCKB${parent.id.slice(-2)}${i}`,
          referrerId: parent.id,
          isActive: true
        }
      });
      level2.push(u);
    }
  }

  // Level 3: 1 Referrer and 1 Student under each Level 2
  for(let parent of level2) {
    // 1 Referrer
    await prisma.user.create({
      data: {
        name: `Mehmet 3. Kademe (Sponsor: ${parent.name.split(' ')[0]})`,
        username: `mock_mehmet_${parent.id.slice(-4)}_1`,
        password,
        role: 'PARENT',
        referralCode: `MOCKC${parent.id.slice(-2)}`,
        referrerId: parent.id,
        isActive: true
      }
    });

    // 1 Student
    await prisma.user.create({
      data: {
        name: `Öğrenci Ali (Sponsor: ${parent.name.split(' ')[0]})`,
        username: `mock_student_${parent.id.slice(-4)}_2`,
        password,
        role: 'STUDENT',
        referrerId: parent.id,
        isActive: true,
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +1 month
      }
    });
  }

  console.log("Mock network created successfully! Total ~21 users.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
