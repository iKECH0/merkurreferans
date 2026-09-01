import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, Hourglass, Banknote } from 'lucide-react';

export const metadata = {
  title: "Referans Paneli | MERKÜR REFERANS",
};

export default async function ReferrerDashboard() {
  const session = await auth();
  
  // Get user details to access referralCode
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: true,
      commissionsEarned: true
    }
  });

  const referralCode = user.referralCode || "YOK";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://merkurreferans.com.tr";
  const inviteLink = `${baseUrl}/register?ref=${referralCode}`;

  const totalStudents = user.referrals.length;
  const activeStudents = user.referrals.filter(s => s.isActive).length;

  const pendingCommissions = user.commissionsEarned
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + c.amount, 0);

  const paidCommissions = user.commissionsEarned
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="dashboard-wrapper">
      <h2>Hoş Geldiniz, {user.name}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Özel davet bağlantınızı paylaşarak hemen kazanmaya başlayın.
      </p>

      {/* Invite Link Panel */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid #10b981' }}>
        <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>🔗 Özel Davet Bağlantınız</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            readOnly 
            value={inviteLink} 
            className="input-field" 
            style={{ flex: '1', background: 'rgba(0,0,0,0.2)', cursor: 'text' }}
          />
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Bu bağlantıyı öğrencilerinizle veya velilerinizle paylaşın. Bu link üzerinden kayıt olan her öğrenci otomatik olarak sizin ağınıza eklenecektir.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel tilt-effect" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Öğrenci</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1 }}>{totalStudents}</p>
            <span className="stat-trend trend-up" style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>{activeStudents} Aktif</span>
          </div>
        </div>

        <div className="stat-card glass-panel tilt-effect" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hourglass size={28} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bekleyen Kazanç</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1 }}>₺{pendingCommissions}</p>
            <span className="stat-trend" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Onay bekliyor</span>
          </div>
        </div>

        <div className="stat-card glass-panel tilt-effect" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Banknote size={28} />
          </div>
          <div className="stat-info" style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ödenen Kazanç</h3>
            <p className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1 }}>₺{paidCommissions}</p>
            <span className="stat-trend trend-up" style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>Hesabınıza yatırılan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
