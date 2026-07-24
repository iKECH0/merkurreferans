// One-time script to fix existing lesson times
// Old code stored local time as UTC, so times are 3 hours ahead
// This script shifts SCHEDULED lessons back by 3 hours

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLessonTimes() {
  const lessons = await prisma.lesson.findMany({
    where: { status: 'SCHEDULED' }
  });

  console.log(`Found ${lessons.length} scheduled lessons to fix`);

  for (const lesson of lessons) {
    const oldStart = new Date(lesson.startTime);
    const oldEnd = new Date(lesson.endTime);
    
    // Shift back by 3 hours (Turkey is UTC+3)
    const newStart = new Date(oldStart.getTime() - 3 * 60 * 60 * 1000);
    const newEnd = new Date(oldEnd.getTime() - 3 * 60 * 60 * 1000);

    console.log(`Lesson "${lesson.title}": ${oldStart.toISOString()} -> ${newStart.toISOString()}`);

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        startTime: newStart,
        endTime: newEnd,
      }
    });
  }

  console.log('All lesson times fixed!');
  await prisma.$disconnect();
}

fixLessonTimes().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
