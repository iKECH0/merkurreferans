import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TeamClient from './TeamClient';
import { isTeacherRole, TEACHER_ROLES } from '@/lib/roleConstants';

export const metadata = {
  title: "Ekibim | MERKÜR REFERANS",
  description: "Alt referanslar ve ekip yönetimi",
};

export default async function ReferrerTeam() {
  const session = await auth();
  
  if (!session || !isTeacherRole(session.user.role)) {
    redirect('/referrer'); // Sadece Öğretmenler görebilir
  }

  const team = await prisma.user.findMany({
    where: { 
      referrerId: session.user.id,
      role: { in: TEACHER_ROLES }
    },
    include: {
      _count: { select: { referrals: true } }
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
      createdAt: true,
      _count: { select: { referrals: true } }
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
