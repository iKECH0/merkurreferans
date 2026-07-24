import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: "Kazançlarım | MERKÜR ODAK",
};

export default async function ReferrerCommissions() {
  const session = await auth();
  
  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  const transactions = wallet?.transactions || [];

  return (
    <div className="dashboard-wrapper">
      <h2>Sanal Cüzdanım ve Kazançlar</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Tüm abonelik referanslarınızdan ve canlı derslerinizden elde ettiğiniz kazançların dökümü.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="stat-card glass-panel" style={{ flex: 1, minWidth: '250px' }}>
          <h3>Çekilebilir Bakiye</h3>
          <div className="value" style={{ color: '#10b981' }}>₺{wallet?.balance?.toFixed(2) || '0.00'}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ödemesini talep edebileceğiniz net kazanç.</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          Henüz cüzdanınızda bir hareket bulunmuyor.
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Cüzdan Hareketleri</h3>
          <div className="table-responsive">
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>İşlem / Açıklama</th>
                  <th>Tutar (₺)</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  return (
                    <tr key={t.id}>
                      <td>{new Date(t.createdAt).toLocaleDateString('tr-TR')} {new Date(t.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{t.description || 'Sistem İşlemi'}</td>
                      <td style={{ fontWeight: 'bold', color: t.type === 'WITHDRAWN' ? '#ef4444' : '#10b981' }}>
                        {t.type === 'WITHDRAWN' ? '-' : '+'}₺{t.amount.toFixed(2)}
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          background: t.type === 'WITHDRAWN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: t.type === 'WITHDRAWN' ? '#ef4444' : '#10b981'
                        }}>
                          {t.type === 'WITHDRAWN' ? 'Çekildi/Ödendi' : 'Kazanıldı'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
