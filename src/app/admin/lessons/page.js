import { prisma } from "@/lib/prisma";
import { getUserLevel } from "@/lib/userLevels";
import AdminLessonsClient from "./AdminLessonsClient";

export const metadata = {
  title: "Tüm Canlı Dersler | Admin",
};

export default async function AdminLessonsPage() {
  const rawLessons = await prisma.lesson.findMany({
    include: { 
      student: {
        include: {
          _count: { select: { referrals: true } }
        }
      },
      teacher: {
        include: {
          _count: { select: { referrals: true } }
        }
      }
    },
    orderBy: { startTime: 'desc' }
  });

  const lessons = rawLessons.map((l) => ({
    id: l.id,
    title: l.title,
    startTime: l.startTime.toISOString(),
    endTime: l.endTime.toISOString(),
    status: l.status,
    price: l.price,
    zoomLink: l.zoomLink,
    zoomStartLink: l.zoomStartLink,
    teacher: l.teacher ? {
      name: l.teacher.name,
      username: l.teacher.username,
      role: l.teacher.role
    } : null,
    teacherLevel: l.teacher ? getUserLevel(l.teacher.role, l.teacher._count?.referrals || 0) : null,
    student: l.student ? {
      name: l.student.name,
      username: l.student.username,
      role: l.student.role
    } : null,
    studentLevel: l.student ? getUserLevel(l.student.role, l.student._count?.referrals || 0) : null,
  }));

  return (
    <div className="dashboard-wrapper">
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--text-main)" }}>🎓 Tüm Canlı Dersler (Zoom)</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Sistemde planlanan tüm canlı dersleri, Zoom linklerini ve durumlarını buradan takip edebilir, doğrudan derse gidebilir veya Zoom linkini kopyalayabilirsiniz.
        </p>
      </div>

      <AdminLessonsClient lessons={lessons} />
    </div>
  );
}
