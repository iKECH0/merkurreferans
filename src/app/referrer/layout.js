import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { LayoutDashboard, Users, Video, Briefcase, GraduationCap, LogOut } from 'lucide-react';
import { getUserLevel } from '@/lib/userLevels';
import '../admin/admin.css';

export default async function ReferrerLayout({ children }) {
  const session = await auth();

  const allowedRoles = ['REFERRER', 'TEACHER', 'LEADER_TEACHER', 'PARENT'];
  if (!session || !allowedRoles.includes(session.user.role)) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      _count: {
        select: { referrals: true }
      }
    }
  });

  const levelInfo = getUserLevel(dbUser?.role || session.user.role, dbUser?._count?.referrals || 0);

  return (
    <div className="admin-container">
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>MERKÜR REFERANS</h2>
          <span className="badge" style={{ background: '#10b981' }}>Referans</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/referrer" className="nav-item">
            <LayoutDashboard className="nav-icon" size={20} />
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link href="/referrer/students" className="nav-item">
            <GraduationCap className="nav-icon" size={20} />
            <span className="nav-text">Öğrenciler</span>
          </Link>
          {['TEACHER', 'LEADER_TEACHER'].includes(session.user.role) && (
            <Link href="/referrer/team" className="nav-item">
              <Users className="nav-icon" size={20} />
              <span className="nav-text">Ekibim</span>
            </Link>
          )}
          <Link href="/referrer/lessons" className="nav-item">
            <Video className="nav-icon" size={20} />
            <span className="nav-text">Canlı Dersler</span>
          </Link>
          <Link href="/referrer/commissions" className="nav-item">
            <Briefcase className="nav-icon" size={20} />
            <span className="nav-text">Cüzdan</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{session.user.username.charAt(0).toUpperCase()}</div>
            <div>
              <p className="username" style={{ lineHeight: '1.2' }}>{session.user.username}</p>
              <p style={{ fontSize: '0.75rem', color: levelInfo.color, marginBottom: '0.3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span>{levelInfo.icon}</span> {levelInfo.title}
              </p>
              <LogoutButton className="logout-btn">Çıkış Yap</LogoutButton>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <header className="topbar glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Referans Paneli</h1>
          <LogoutButton className="btn-sm btn-danger" style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
             <LogOut size={16} /> Çıkış
          </LogoutButton>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
