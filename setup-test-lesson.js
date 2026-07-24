// Script to:
// 1. Mark existing SCHEDULED lessons as COMPLETED (they are past)
// 2. Create a new test lesson from 10:00 to 11:00 today (Turkey time)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupTestData() {
  // 1. Mark old SCHEDULED lessons as COMPLETED
  const updated = await prisma.lesson.updateMany({
    where: { status: 'SCHEDULED' },
    data: { status: 'COMPLETED' }
  });
  console.log(`Marked ${updated.count} old lessons as COMPLETED`);

  // 2. Find a teacher (referrer) and student for the new lesson
  const teacher = await prisma.user.findFirst({
    where: { role: { in: ['REFERRER', 'TEACHER', 'LEADER_TEACHER', 'ADMIN'] } }
  });
  
  const student = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  });

  if (!teacher || !student) {
    console.log('No teacher or student found, cannot create test lesson');
    await prisma.$disconnect();
    return;
  }

  console.log(`Teacher: ${teacher.name || teacher.username} (${teacher.id})`);
  console.log(`Student: ${student.name || student.username} (${student.id})`);

  // 3. Create new lesson: today 10:00 - 11:00 Turkey time (UTC+3)
  // Turkey 10:00 = UTC 07:00
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // JS months are 0-indexed
  const day = now.getUTCDate();
  
  // Since current Turkey time is ~10:14, we need today's date in Turkey
  // Turkey is UTC+3, so we calculate based on UTC
  const turkeyNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const tYear = turkeyNow.getUTCFullYear();
  const tMonth = turkeyNow.getUTCMonth();
  const tDay = turkeyNow.getUTCDate();
  
  // Create dates for 10:00 and 11:00 Turkey time
  // Turkey 10:00 = UTC 07:00
  const startTime = new Date(Date.UTC(tYear, tMonth, tDay, 7, 0, 0));
  const endTime = new Date(Date.UTC(tYear, tMonth, tDay, 8, 0, 0));

  console.log(`Creating lesson: ${startTime.toISOString()} to ${endTime.toISOString()}`);
  console.log(`Turkey time: 10:00 - 11:00`);

  const lesson = await prisma.lesson.create({
    data: {
      title: 'Hızlı Okuma - Temel Teknikler',
      teacherId: teacher.id,
      studentId: student.id,
      startTime: startTime,
      endTime: endTime,
      zoomLink: 'https://zoom.us/j/test-link',
      zoomStartLink: 'https://zoom.us/s/test-start-link',
      zoomMeetingId: 'test-meeting-id',
      price: 500,
      status: 'SCHEDULED'
    }
  });

  console.log(`Created new test lesson: "${lesson.title}" (${lesson.id})`);
  console.log('Done!');
  
  await prisma.$disconnect();
}

setupTestData().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
