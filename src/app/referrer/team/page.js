import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TeamClient from './TeamClient';

export const metadata = {
  title: "Ekibim | MERKÜR ODAK",
};

export default async function ReferrerTeam() {
  const session = await auth();
  
  if (!session || session.user.role !== 'LEADER_TEACHER') {
    redirect('/referrer'); // Sadece Lider Öğretmenler görebilir
  }

  const team = await prisma.user.findMany({
    where: { 
      referrerId: session.user.id,
      role: 'TEACHER'
    },
    orderBy: { createdAt: 'desc' }
  });

  const allUsersForTree = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      referrerId: true,
      createdAt: true
    }
  });

  return (
    <div className="dashboard-wrapper">
      <h2>Referans Kadrom</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Kendi altınıza (ekibinize) eklediğiniz aktif referansları yönetin.
      </p>

      <TeamClient 
        initialTeam={team} 
        allUsersForTree={allUsersForTree}
        currentUserId={session.user.id}
      />
    </div>
  );
}
