import { prisma } from "@/lib/prisma";

export async function updateStreakAndLastActive(userId, durationSecs = 60) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    // Use local timezone for "today"
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let newStreak = user.streak || 0;
    
    if (user.lastActive) {
      const last = user.lastActive;
      const lastActiveStart = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      
      const diffTime = todayStart.getTime() - lastActiveStart.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Came back exactly the next day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Missed a day or more
        newStreak = 1;
      }
      // If diffDays === 0, they already played today, streak remains the same
    } else {
      // First time playing
      newStreak = 1;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { 
        streak: newStreak,
        lastActive: now,
        totalTimeSpent: { increment: durationSecs }
      }
    });
  } catch (error) {
    console.error("Streak Update Error", error);
  }
}
