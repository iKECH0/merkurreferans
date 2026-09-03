'use client';

import { useState } from 'react';
import { processDeletionRequest } from '../hesapsilme/actions';
import { Trash2, XCircle, AlertTriangle, CheckCircle2, UserX, Clock } from 'lucide-react';

export default function PendingDeletionsClient({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState(null);

  if (!requests || requests.length === 0) {
    return null; // Talebi olmayan durumda yer kaplamasın
  }

  async function handleAction(id, action, username) {
    const confirmMessage = action === 'APPROVE' 
      ? `"${username}" kullanıcısının hesabını ve ilişkili tüm verilerini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`
      : `Bu silme talebini reddetmek istediğinizden emin misiniz?`;

    if (!confirm(confirmMessage)) return;

    setLoadingId(id);
    try {
      const res = await processDeletionRequest(id, action);
      if (res.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        alert(res.error || 'İşlem gerçekleştirilemedi.');
      }
    } catch (e) {
      alert('Bağlantı hatası oluştu.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Başlık Satırı */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Silinmeyi Bekleyen Hesap Talepleri
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '0.15rem 0.6rem',
                borderRadius: '999px',
                fontWeight: 600
              }}>
                {requests.length} Talep
              </span>
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Google Play & KVKK politikaları gereği kullanıcılar tarafından iletilen hesap silme istekleri.
            </p>
          </div>
        </div>
      </div>

      {/* Talepler Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {requests.map(req => (
          <div key={req.id} style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>
                  {req.name && req.name !== 'Belirtilmedi' ? req.name : req.username}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  (@{req.username})
                </span>
                {req.phone && (
                  <span style={{ color: '#38bdf8', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    📞 {req.phone}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#94a3b8' }}>Neden:</strong> {req.reason || 'Kullanıcı talebiyle hesap silme'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                <Clock size={13} /> {new Date(req.createdAt).toLocaleString('tr-TR')}
              </div>
            </div>

            {/* İşlem Butonları */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => handleAction(req.id, 'APPROVE', req.username)}
                disabled={loadingId === req.id}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: loadingId === req.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                }}
              >
                <UserX size={16} /> Hesabı ve Verileri Sil
              </button>

              <button
                onClick={() => handleAction(req.id, 'REJECT', req.username)}
                disabled={loadingId === req.id}
                style={{
                  background: 'rgba(51, 65, 85, 0.8)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: loadingId === req.id ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <XCircle size={16} /> Reddet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
