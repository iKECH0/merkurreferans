import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LessonManagerClient from "./LessonManagerClient";
import { isReferrerRole } from "@/lib/roleConstants";

export const metadata = {
  title: "Canlı Derslerim - Merkür Referans Platformu",
};

export default async function LessonsPage() {
  const session = await auth();
  if (!session || (!isReferrerRole(session.user.role) && session.user.role !== 'ADMIN')) {
    redirect("/login");
  }

  const isTester = session.user.username.toLowerCase() === 'tester';

  // Fetch lessons where the current user is the teacher
  const realLessons = await prisma.lesson.findMany({
    where: { teacherId: session.user.id },
    include: { student: true },
    orderBy: { startTime: 'desc' }
  });

  const mockLessons = [
    {
      id: "mock-lesson-1",
      title: "YKS Matematik: Türev ve İntegral Uygulamaları",
      price: 1200,
      startTime: new Date(Date.now() - 10 * 60000).toISOString(),
      endTime: new Date(Date.now() + 50 * 60000).toISOString(),
      status: "SCHEDULED",
      zoomStartLink: "https://zoom.us/j/123456",
      student: { name: "Berke Yılmaz", username: "berkeyilmaz" }
    },
    {
      id: "mock-lesson-2",
      title: "TYT Fizik: Newton'un Hareket Yasaları",
      price: 950,
      startTime: new Date(Date.now() + 120 * 60000).toISOString(),
      endTime: new Date(Date.now() + 180 * 60000).toISOString(),
      status: "SCHEDULED",
      zoomStartLink: "https://zoom.us/j/123456",
      student: { name: "Elif Demir", username: "elifdemir" }
    },
    {
      id: "mock-lesson-3",
      title: "AYT Geometri: Çemberde Teğet ve Kiriş",
      price: 850,
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() - 82800000).toISOString(),
      status: "COMPLETED",
      zoomStartLink: "",
      student: { name: "Kaan Çetin", username: "kaancetin" }
    }
  ];

  const lessons = isTester ? mockLessons : realLessons;

  // Fetch students or fallback to mock
  const realStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, username: true, referrerId: true }
  });

  const mockStudents = [
    { id: "mock-s-1", name: "Berke Yılmaz", username: "berkeyilmaz", referrerId: session.user.id, myId: session.user.id },
    { id: "mock-s-2", name: "Elif Demir", username: "elifdemir", referrerId: session.user.id, myId: session.user.id },
    { id: "mock-s-3", name: "Kaan Çetin", username: "kaancetin", referrerId: session.user.id, myId: session.user.id },
    { id: "mock-s-4", name: "Zeynep Aydın", username: "zeynepaydin", referrerId: "other", myId: session.user.id },
    { id: "mock-s-5", name: "Mert Kaya", username: "mertkaya", referrerId: session.user.id, myId: session.user.id },
  ];

  const mappedStudents = isTester ? mockStudents : realStudents.map(s => ({
    ...s,
    myId: session.user.id
  }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--text-main)", fontSize: "1.8rem", fontWeight: "800" }}>🎓 Canlı Ders Yönetimi (Zoom)</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Öğrencileriniz için birebir canlı dersler oluşturun, Zoom linklerini otomatik yönetin ve ders bitiminde komisyonlarınızı cüzdanınıza aktarın.
        </p>
      </div>

      <LessonManagerClient lessons={lessons} students={mappedStudents} />
    </div>
  );
}
