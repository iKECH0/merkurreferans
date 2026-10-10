import { prisma } from "@/lib/prisma";
import AddStudentClient from "./AddStudentClient";
import StudentListClient from "./StudentListClient";
import CsvImportClient from "./CsvImportClient";
import PendingDeletionsClient from "../PendingDeletionsClient";
import { TEACHER_ROLES } from "@/lib/roleConstants";

export default async function StudentsPage() {
  const pendingDeletions = await prisma.deletionRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });

  const [students, teachers] = await Promise.all([prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    include: {
      referrer: { select: { name: true, username: true } },
      assignedTeacher: { select: { id: true, name: true, username: true } },
      _count: { select: { referrals: true } }
    },
    orderBy: { createdAt: "desc" }
  }), prisma.user.findMany({
    where: { role: { in: TEACHER_ROLES } },
    select: { id: true, name: true, username: true, role: true },
    orderBy: { name: "asc" }
  })]);

  return (
    <div className="dashboard-wrapper">
      <PendingDeletionsClient initialRequests={pendingDeletions} />

      <div className="top-bar-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kullanıcı Yönetimi (Öğrenci & Referans)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <CsvImportClient />
          <AddStudentClient teachers={teachers} />
        </div>
      </div>

      <StudentListClient initialStudents={students} teachers={teachers} />
    </div>
  );
}
