import { prisma } from "@/lib/prisma";
import { Users, GraduationCap, BookOpen, Wallet } from 'lucide-react';
import PendingDeletionsClient from "./PendingDeletionsClient";
import { TEACHER_ROLES } from "@/lib/roleConstants";

export default async function AdminDashboard() {
  const pendingDeletions = await prisma.deletionRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });

  const totalStudents = await prisma.user.count({
    where: { role: 'STUDENT' }
  });

  const totalTeachers = await prisma.user.count({
    where: { role: { in: TEACHER_ROLES } }
  });
  
  const totalLessons = await prisma.lesson.count();

  const activeWallets = await prisma.wallet.count({
    where: { balance: { gt: 0 } }
  });

  return (
    <div className="dashboard-wrapper">
      <PendingDeletionsClient initialRequests={pendingDeletions} />
      <div className="stats-grid">
        <div className="stat-card glass-panel tilt-effect" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kayıtlı Öğrenciler</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1 }}>{totalStudents}</p>
            <span className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Sisteme kayıtlı öğrenciler</span>
          </div>
        </div>

        <div className="stat-card glass-panel tilt-effect" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={28} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kayıtlı Öğretmenler</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1 }}>{totalTeachers}</p>
            <span className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Sisteme kayıtlı öğretmenler</span>
          </div>
        </div>

        <div className="stat-card glass-panel tilt-effect" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Ders</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1 }}>{totalLessons}</p>
            <span className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Oluşturulan tüm dersler</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel tilt-effect" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={28} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aktif Cüzdanlar</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1 }}>{activeWallets}</p>
            <span className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Bakiyesi olan kullanıcı sayısı</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="recent-activity glass-panel">
          <h3>Son Aktiviteler</h3>
          <div className="empty-state">
            Şu an için gösterilecek bir aktivite yok.
          </div>
        </div>
      </div>
    </div>
  );
}
