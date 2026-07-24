import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LessonManagerClient from "./LessonManagerClient";

export const metadata = {
  title: "Canlı Derslerim - Merkür Referans Platformu",
};

export default async function LessonsPage() {
  const session = await auth();
  const allowedRoles = ['REFERRER', 'TEACHER', 'LEADER_TEACHER', 'ADMIN'];
  if (!session || !allowedRoles.includes(session.user.role)) {
    redirect("/login");
  }

  // Fetch lessons where the current user is the teacher
  const lessons = await prisma.lesson.findMany({
    where: { teacherId: session.user.id },
    include: { student: true },
    orderBy: { startTime: 'desc' }
  });

  // Fetch all students to populate the dropdown.
  // In a real scenario, this might be filtered to students assigned to this teacher,
  // or students that the teacher has referred.
  // We'll fetch all students but map their referrerId so the UI knows if it's "Senaryo A" or "Senaryo B"
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, username: true, referrerId: true }
  });

  // Attach a property "myId" to help the client evaluate
  const mappedStudents = students.map(s => ({
    ...s,
    myId: session.user.id
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--text-main)" }}>🎓 Canlı Ders Yönetimi (Zoom)</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Öğrencileriniz için birebir canlı dersler oluşturun, Zoom linklerini otomatik yönetin ve ders bitiminde komisyonlarınızı (cüzdanınıza) otomatik aktarın.
        </p>
      </div>

      <LessonManagerClient lessons={lessons} students={mappedStudents} />
    </div>
  );
}
