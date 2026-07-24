import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { Home, Video, LogOut } from 'lucide-react';
import '../admin/admin.css';

export default async function StudentLayout({ children }) {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>MERKÜR REFERANS</h2>
          <span className="badge" style={{ background: '#3b82f6' }}>Öğrenci</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/student" className="nav-item">
            <Home className="nav-icon" size={20} />
            <span className="nav-text">Ana Sayfa</span>
          </Link>
          <Link href="/student/lessons" className="nav-item">
            <Video className="nav-icon" size={20} />
            <span className="nav-text">Canlı Dersler</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{session.user.username.charAt(0).toUpperCase()}</div>
            <div>
              <p className="username" style={{ lineHeight: '1.2' }}>{session.user.username}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                Öğrenci
              </p>
              <LogoutButton className="logout-btn">Çıkış Yap</LogoutButton>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <header className="topbar glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Öğrenci Paneli</h1>
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
