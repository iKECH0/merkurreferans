import { prisma } from "@/lib/prisma";
import AddStudentClient from "./AddStudentClient";
import StudentListClient from "./StudentListClient";
import CsvImportClient from "./CsvImportClient";

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="dashboard-wrapper">
      <div className="top-bar-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kullanıcı Yönetimi (Öğrenci & Referans)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <CsvImportClient />
          <AddStudentClient />
        </div>
      </div>

      <StudentListClient initialStudents={students} />
    </div>
  );
}
