import Link from 'next/link';
import { ArrowRight, Video, Users, PieChart } from 'lucide-react';
import './globals.css';

export const metadata = {
  title: "MERKÜR REFERANS | Canlı Ders ve Referans Platformu",
  description: "Öğretmenler, öğrenciler ve referanslar için entegre canlı ders ve komisyon yönetim sistemi."
};

export default function LandingPage() {
  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
      
      {/* NAVBAR */}
      <nav className="landing-nav" style={{ padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="landing-logo" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--primary)' }}>🎓 MERKÜR</span> REFERANS
        </div>
        <div className="landing-nav-buttons" style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px' }}>
            Sisteme Giriş
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ padding: '8rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', flex: 1 }}>
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.2, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '300px', height: '300px', background: 'var(--secondary)', filter: 'blur(150px)', opacity: 0.2, borderRadius: '50%' }}></div>
        
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          MERKÜR REFERANS
        </h1>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: '500', position: 'relative', zIndex: 1 }}>
          Canlı Ders ve Referans Yönetim Sistemi
        </h2>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem', lineHeight: '1.6', position: 'relative', zIndex: 1 }}>
          Öğretmenler, öğrenciler ve referanslar için tasarlanmış profesyonel altyapı. Canlı derslerinizi yönetin, ağınızı kurun ve komisyonlarınızı anlık olarak takip edin.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginBottom: '4rem', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%', color: '#60a5fa' }}>
              <Video size={32} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Canlı Dersler</h3>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%', color: '#34d399' }}>
              <Users size={32} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Referans Ağı</h3>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '50%', color: '#fbbf24' }}>
              <PieChart size={32} />
            </div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Komisyon Takibi</h3>
          </div>
        </div>

        <Link href="/login" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
          Panele Giriş Yap <ArrowRight size={20} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem 5%', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p>© {new Date().getFullYear()} MERKÜR REFERANS. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
