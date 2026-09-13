import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentLessonsClient from "./StudentLessonsClient";
import { executeLessonCompletion } from "@/app/referrer/lessons/actions";

export const metadata = {
  title: "Canlı Derslerim | Öğrenci Paneli",
};

export default async function StudentLessonsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.isActive) {
    redirect("/student");
  }

  // Auto-complete past scheduled lessons safely with commission payouts
  const now = new Date();
  const expiredLessons = await prisma.lesson.findMany({
    where: {
      studentId: session.user.id,
      status: 'SCHEDULED',
      endTime: { lt: now }
    },
    select: { id: true }
  });

  for (const exp of expiredLessons) {
    await executeLessonCompletion(exp.id);
  }

  const lessons = await prisma.lesson.findMany({
    where: { studentId: session.user.id },
    include: { teacher: true },
    orderBy: { startTime: 'asc' }
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--text-main)" }}>🎓 Canlı Derslerim</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Size atanan canlı ders programınızı aşağıdan takip edebilir ve saati geldiğinde derse katılabilirsiniz.
        </p>
      </div>

      <StudentLessonsClient lessons={lessons} />
    </div>
  );
}
