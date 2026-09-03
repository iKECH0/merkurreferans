import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import StudentsClient from './StudentsClient';

export const metadata = {
  title: "Öğrencilerim | MERKÜR REFERANS",
};

export default async function ReferrerStudents() {
  const session = await auth();
  
  const isTester = session.user.username.toLowerCase() === 'tester';

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: {
        where: { role: 'STUDENT' }, // Sadece öğrencileri getir
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const mockStudents = [
    { id: "mock-std-1", name: "Berke Yılmaz", username: "berkeyilmaz", phone: "0532 111 22 33", isActive: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), subscriptionEnd: new Date(Date.now() + 86400000 * 28).toISOString() },
    { id: "mock-std-2", name: "Elif Demir", username: "elifdemir", phone: "0544 222 33 44", isActive: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), subscriptionEnd: new Date(Date.now() + 86400000 * 25).toISOString() },
    { id: "mock-std-3", name: "Kaan Çetin", username: "kaancetin", phone: "0555 333 44 55", isActive: true, createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), subscriptionEnd: new Date(Date.now() + 86400000 * 21).toISOString() },
    { id: "mock-std-4", name: "Zeynep Aydın", username: "zeynepaydin", phone: "0505 444 55 66", isActive: true, createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), subscriptionEnd: new Date(Date.now() + 86400000 * 16).toISOString() },
    { id: "mock-std-5", name: "Mert Kaya", username: "mertkaya", phone: "0533 555 66 77", isActive: true, createdAt: new Date(Date.now() - 86400000 * 18).toISOString(), subscriptionEnd: new Date(Date.now() + 86400000 * 12).toISOString() },
  ];

  const students = isTester ? mockStudents : (user?.referrals || []);

  return <StudentsClient students={students} currentUserId={session.user.id} />;
}
