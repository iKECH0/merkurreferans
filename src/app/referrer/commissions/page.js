import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

export const metadata = {
  title: "Kazançlarım | MERKÜR REFERANS",
  description: "Komisyon ve kazanç detayları",
};

export default async function ReferrerCommissions() {
  const session = await auth();
  
  const isTester = session.user.username.toLowerCase() === 'tester';

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const mockTransactions = [
    {
      id: "mock-tx-1",
      createdAt: new Date().toISOString(),
      description: "YKS Matematik (Türev) Canlı Ders Hakedişi",
      amount: 1200,
      type: "EARNED"
    },
    {
      id: "mock-tx-2",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      description: "Yeni Öğrenci Referans Abonelik Primi (Ahmet K.)",
      amount: 850,
      type: "EARNED"
    },
    {
      id: "mock-tx-3",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      description: "TYT Fizik Birebir Özel Ders Komisyonu",
      amount: 950,
      type: "EARNED"
    },
    {
      id: "mock-tx-4",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      description: "TR12 0006 2000... IBAN Hesabına Para Çekme",
      amount: 15000,
      type: "WITHDRAWN"
    },
    {
      id: "mock-tx-5",
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      description: "Lider Eğitmen Ekip Komisyon Paylaşımı",
      amount: 4500,
      type: "EARNED"
    }
  ];

  const balance = isTester ? 36750.00 : (wallet?.balance || 0);
  const transactions = isTester ? mockTransactions : (wallet?.transactions || []);

  return (
    <div style={{ padding: '0.5rem 0 2rem' }}>
      
      {/* 1. Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: '0 0 0.5rem 0' }}>
          💰 Sanal Cüzdanım & Kazançlar
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          Tüm abonelik referanslarınızdan ve verdiğiniz canlı derslerden elde ettiğiniz kazançların detaylı dökümü.
        </p>
      </div>

      {/* 2. Bakiye Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Çekilebilir Net Bakiye</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#10b981', lineHeight: 1, marginBottom: '0.5rem' }}>
            ₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Banka hesabınıza aktarılabilir bakiye.</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bekleyen Ders Komisyonları</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#fbbf24', lineHeight: 1, marginBottom: '0.5rem' }}>
            ₺4.850,00
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Planlanan dersler bittiğinde aktarılır.</p>
        </div>

      </div>

      {/* 3. Cüzdan Hareketleri Tablosu */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.25rem' }}>
          Son Hesap Hareketleri
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transactions.map((t) => {
            const isWithdraw = t.type === 'WITHDRAWN';
            return (
              <div key={t.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '14px',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: isWithdraw ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isWithdraw ? '#ef4444' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isWithdraw ? <ArrowDownRight size={22} /> : <ArrowUpRight size={22} />}
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>{t.description}</p>
                    <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(t.createdAt).toLocaleDateString('tr-TR')} • {new Date(t.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    margin: 0,
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    color: isWithdraw ? '#ef4444' : '#10b981'
                  }}>
                    {isWithdraw ? '-' : '+'}₺{t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '0.2rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    background: isWithdraw ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: isWithdraw ? '#f87171' : '#10b981'
                  }}>
                    {isWithdraw ? 'Banka Çekimi' : 'Hesaba Geçti'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
