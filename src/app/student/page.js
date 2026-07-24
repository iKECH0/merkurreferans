import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Video } from 'lucide-react';

export const metadata = {
  title: "Öğrenci Paneli | MERKÜR REFERANS",
};

export default async function StudentDashboard() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className="dashboard-wrapper">
      <h2>Hoş Geldin, {user.name}</h2>
      
      {!user.isActive && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid #fbbf24', background: 'rgba(245, 158, 11, 0.1)' }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '0.5rem' }}>⏳ Hesabınız Onay Bekliyor</h3>
          <p style={{ color: 'var(--text-main)' }}>
            Lütfen ödemenizi tamamlayarak yöneticiniz veya referansniz ile iletişime geçin. Aboneliğiniz onaylandıktan sonra canlı derslere erişebilirsiniz.
          </p>
        </div>
      )}

      {user.isActive && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>✅ Aboneliğiniz Aktif</h3>
          <p style={{ color: 'var(--text-main)' }}>
            Eğitimlerinize başlayabilirsiniz. Sol menüden Canlı Derslerim sekmesine geçerek takvimi inceleyin.
          </p>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card glass-panel tilt-effect">
          <div className="stat-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', marginBottom: '1rem' }}>
            <Video size={24} />
          </div>
          <div className="stat-info">
            <h3>Canlı Derslerim</h3>
            <p className="stat-value">Takvimi Gör</p>
            <Link href="/student/lessons" style={{ color: '#60a5fa', fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-block', textDecoration: 'none' }}>
              Derslere Git  
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
