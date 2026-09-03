import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, Hourglass, Banknote, Copy, ArrowRight, Video, GraduationCap, Award } from 'lucide-react';

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

  const isTester = session.user.username.toLowerCase() === 'tester';

  const referralCode = user?.referralCode || "MERKUR2026";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://merkurreferans.com.tr";
  const inviteLink = `${baseUrl}/register?ref=${referralCode}`;

  // If tester account, inject high-ticket realistic mock numbers for screenshots
  const totalStudents = isTester ? 48 : (user?.referrals?.length || 0);
  const activeStudents = isTester ? 42 : (user?.referrals?.filter(s => s.isActive).length || 0);

  const pendingCommissions = isTester ? 4850 : (
    user?.commissionsEarned
      ?.filter(c => c.status === 'PENDING')
      ?.reduce((sum, c) => sum + c.amount, 0) || 0
  );

  const paidCommissions = isTester ? 36750 : (
    user?.commissionsEarned
      ?.filter(c => c.status === 'PAID')
      ?.reduce((sum, c) => sum + c.amount, 0) || 0
  );

  return (
    <div style={{ padding: '0.5rem 0 2rem' }}>
      
      {/* 1. Premium Karşılama Alanı */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -20px rgba(16, 185, 129, 0.15)'
      }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.3rem 0.75rem', borderRadius: '99px', color: '#10b981', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          <Award size={14} /> Lider Eğitmen & Referans Ağı
        </div>
        
        <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: '800', color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Hoş Geldiniz, <span style={{ background: 'linear-gradient(to right, #10b981, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || session.user.username}</span> 👋
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '560px', margin: 0, position: 'relative', zIndex: 1 }}>
          Özel davet bağlantınızı paylaşarak öğrenci ağınızı büyütün, canlı dersler planlayın ve anında kazanç sağlayın.
        </p>
      </div>

      {/* 2. Davet Linki Kartı */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ color: '#10b981', fontSize: '1.05rem', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔗 Özel Referans Bağlantınız
          </h3>
          <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
            Kod: {referralCode}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            readOnly 
            value={inviteLink} 
            className="input-field" 
            style={{ flex: '1', minWidth: '200px', background: 'rgba(0,0,0,0.3)', color: '#38bdf8', fontWeight: '500', fontSize: '0.9rem', borderRadius: '10px', padding: '0.75rem 1rem' }}
          />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.6rem', margin: '0.6rem 0 0 0' }}>
          Bu link üzerinden kayıt olan öğrenciler otomatik olarak sizin ağınıza eklenir ve komisyon kazandırır.
        </p>
      </div>

      {/* 3. Kazanç & Öğrenci İstatistik Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        {/* Toplam Öğrenci */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(167, 139, 250, 0.2)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <Users size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.3rem 0' }}>Toplam Öğrenci</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff', margin: '0 0 0.3rem 0', lineHeight: 1 }}>{totalStudents}</p>
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{activeStudents} Aktif Öğrenci</span>
          </div>
        </div>

        {/* Bekleyen Kazanç */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.4)'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <Hourglass size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.3rem 0' }}>Bekleyen Kazanç</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fbbf24', margin: '0 0 0.3rem 0', lineHeight: 1 }}>₺{pendingCommissions.toLocaleString('tr-TR')}</p>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>Ders sonu aktarılacak</span>
          </div>
        </div>

        {/* Ödenen Kazanç */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
          boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.15)'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Banknote size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.3rem 0' }}>Toplam Kazanç</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', margin: '0 0 0.3rem 0', lineHeight: 1 }}>₺{paidCommissions.toLocaleString('tr-TR')}</p>
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>Hesabınıza yansıyan</span>
          </div>
        </div>

      </div>

      {/* 4. Hızlı Erişim Aksiyonları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        <Link href="/referrer/lessons" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={24} />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: '700' }}>Canlı Ders Yönetimi</h4>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Birebir Zoom dersi planla</p>
              </div>
            </div>
            <ArrowRight size={20} color="#3b82f6" />
          </div>
        </Link>

        <Link href="/referrer/commissions" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Banknote size={24} />
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: '700' }}>Cüzdan & Bakiye</h4>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Çekilebilir ₺{paidCommissions.toLocaleString('tr-TR')}</p>
              </div>
            </div>
            <ArrowRight size={20} color="#10b981" />
          </div>
        </Link>

      </div>

    </div>
  );
}
