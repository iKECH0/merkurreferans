import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import StudentsClient from './StudentsClient';

export const metadata = {
  title: "Öğrencilerim | MERKÜR REFERANS",
};

export default async function ReferrerStudents() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: {
        where: { role: 'STUDENT' }, // Sadece öğrencileri getir
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const students = user.referrals;

  return <StudentsClient students={students} currentUserId={session.user.id} />;
}
