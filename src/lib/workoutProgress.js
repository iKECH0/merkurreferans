import { prisma } from "@/lib/prisma";

export async function advanceUserWorkoutStep(userId, day, step) {
  if (day == null || step == null) return;
  
  const currentDay = parseInt(day, 10);
  const currentStep = parseInt(step, 10);
  
  let nextDay = currentDay;
  let nextStep = currentStep + 1;

  if (nextStep >= 5) {
     nextDay += 1;
     nextStep = 0;
  }
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  if (nextDay > user.currentWorkoutDay || (nextDay === user.currentWorkoutDay && nextStep > user.currentWorkoutStep)) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentWorkoutDay: nextDay,
        currentWorkoutStep: nextStep
      }
    });
  }
}
