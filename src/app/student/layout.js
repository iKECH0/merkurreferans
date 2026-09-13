import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { Home, Video, LogOut, FileSpreadsheet } from 'lucide-react';
import '../admin/admin.css';

export default async function StudentLayout({ children }) {
  const session = await auth();

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  const excelUrl = "https://docs.google.com/spreadsheets/d/1IvC7Kme6lZugdHtaQJTsNZ-sYhhYBPEBW5HkEkVmqT0/edit?gid=2037362416#gid=2037362416";

  return (
    <div className="admin-container">
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>MERKÜR YÖRÜNGE</h2>
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
          <a href={excelUrl} target="_blank" rel="noopener noreferrer" className="nav-item">
            <FileSpreadsheet className="nav-icon" size={20} style={{ color: '#10b981' }} />
            <span className="nav-text" style={{ color: '#10b981', fontWeight: '600' }}>Danışmanlık Tablosu</span>
          </a>
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
        <header className="topbar" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px -5px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              {session.user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: '700', lineHeight: 1.2 }}>
                Öğrenci Paneli
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '600' }}>
                @{session.user.username}
              </span>
            </div>
          </div>

          <LogoutButton style={{ 
            padding: '0.45rem 0.85rem', 
            borderRadius: '10px', 
            fontSize: '0.8rem', 
            fontWeight: '600',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
             <LogOut size={15} /> Çıkış
          </LogoutButton>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
