'use client';

import { useState } from 'react';
import { submitDeletionRequest } from './actions';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DeletionFormClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.target);
    const confirmed = formData.get('confirm');

    if (!confirmed) {
      setError('Lütfen verilerinizin silinmesini onayladığınızı belirten kutuyu işaretleyin.');
      setLoading(false);
      return;
    }

    try {
      const res = await submitDeletionRequest(formData);
      if (res.success) {
        setResult(res.message);
        e.target.reset();
      } else {
        setError(res.error || 'Talep iletilemedi.');
      }
    } catch (err) {
      setError('Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          padding: '1rem',
          borderRadius: '50%',
          marginBottom: '1rem'
        }}>
          <CheckCircle size={40} />
        </div>
        <h3 style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
          Talebiniz Alındı!
        </h3>
        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          {result}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Ad Soyad */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>
          Adınız ve Soyadınız (Opsiyonel)
        </label>
        <input
          type="text"
          name="name"
          placeholder="Örn: Ahmet Yılmaz"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Kullanıcı Adı */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>
          Sistemdeki Kullanıcı Adınız <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          name="username"
          required
          placeholder="Örn: ahmet123"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Telefon Numarası */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>
          Kayıtlı Telefon Numaranız (Doğrulama İçin)
        </label>
        <input
          type="tel"
          name="phone"
          placeholder="05XXXXXXXXX"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Silme Nedeni */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>
          Hesabınızı Silme Nedeniniz (Opsiyonel)
        </label>
        <textarea
          name="reason"
          rows={3}
          placeholder="Hizmetten ayrılma nedeninizi belirtebilirsiniz..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '0.95rem',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Onay Kutusu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
        <input
          type="checkbox"
          id="confirm"
          name="confirm"
          required
          style={{ marginTop: '0.25rem', width: '18px', height: '18px', accentColor: '#ef4444' }}
        />
        <label htmlFor="confirm" style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, cursor: 'pointer' }}>
          Hesabımın, profil bilgilerimin ve geçmiş ders verilerimin kalıcı olarak silinmesini onaylıyorum. Bu işlemin geri alınamaz olduğunu kabul ediyorum.
        </label>
      </div>

      {/* Gönder Butonu */}
      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '0.5rem',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          border: 'none',
          padding: '0.85rem 1.5rem',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
          transition: 'opacity 0.2s'
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" /> Talebiniz Gönderiliyor...
          </>
        ) : (
          <>
            <Send size={18} /> Silme Talebini Gönder
          </>
        )}
      </button>

    </form>
  );
}
