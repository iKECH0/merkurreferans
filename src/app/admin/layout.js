import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { LayoutDashboard, Users, Video, Briefcase, Settings, LogOut } from 'lucide-react';
import './admin.css';

export default async function AdminLayout({ children }) {
  const session = await auth();

  // Eğer giriş yapmamışsa login'e at, Admin değilse yetkisiz de
  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Yetkisiz Erişim</h2>
        <p>Bu sayfayı görüntüleme yetkiniz yok. Lütfen öğrenci panelinize dönün.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>MERKÜR REFERANS</h2>
          <span className="badge">Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-item">
            <LayoutDashboard className="nav-icon" size={20} />
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link href="/admin/users" className="nav-item">
            <Users className="nav-icon" size={20} />
            <span className="nav-text">Kullanıcılar</span>
          </Link>
          <Link href="/admin/lessons" className="nav-item">
            <Video className="nav-icon" size={20} />
            <span className="nav-text">Canlı Dersler</span>
          </Link>
          <Link href="/admin/referrals" className="nav-item">
            <Briefcase className="nav-icon" size={20} />
            <span className="nav-text">Referanslar</span>
          </Link>
          <Link href="/admin/settings" className="nav-item">
            <Settings className="nav-icon" size={20} />
            <span className="nav-text">Ayarlar</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{session.user.username.charAt(0).toUpperCase()}</div>
            <div>
              <p className="username" style={{ lineHeight: '1.2' }}>{session.user.username}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                Yönetici
              </p>
              <LogoutButton className="logout-btn">Çıkış Yap</LogoutButton>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <header className="topbar glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Yönetici Paneli</h1>
          <LogoutButton className="btn-sm btn-danger" style={{ padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
             <LogOut size={16} /> Çıkış Yap
          </LogoutButton>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
