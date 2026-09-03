import DeletionFormClient from './DeletionFormClient';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Trash2, CheckCircle2, Info } from 'lucide-react';

export const metadata = {
  title: 'Hesap ve Veri Silme Talebi | Merkür Referans',
  description: 'Merkür Referans platformu hesap ve ilişkili kişisel verilerin silinmesi talebi sayfası.',
};

export default function AccountDeletionPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070a13',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '3rem 1.5rem',
      background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.12) 0%, #070a13 70%)'
    }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {/* Üst Navigasyon */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#38bdf8',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <ArrowLeft size={18} /> Ana Sayfaya Dön
          </Link>
        </div>

        {/* Başlık Kartı */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(12px)',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trash2 size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Hesap ve Veri Silme Talebi
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                Google Play Veri Güvenliği ve KVKK Kapsamında Kullanıcı Hakları
              </p>
            </div>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Merkür Referans platformunda kayıtlı hesabınızın ve bu hesapla ilişkili tüm kişisel verilerinizin kalıcı olarak silinmesini bu form aracılığıyla talep edebilirsiniz.
          </p>
        </div>

        {/* Bilgilendirme Kutuları */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h3 style={{ color: '#38bdf8', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <CheckCircle2 size={18} /> Silinecek Veriler
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <li>Ad, soyad ve profil bilgileri</li>
              <li>Telefon numarası ve giriş kimlikleri</li>
              <li>Canlı ders katılım ve yoklama geçmişi</li>
              <li>Kayıtlı referans bağlantıları</li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h3 style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <Info size={18} /> Saklama Koşulları
            </h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Yasal mevzuat ve Türk Ticaret Kanunu uyarınca mali/finansal kayıtlar yasal zorunlu süre boyunca anonimleştirilerek saklanabilir. Diğer tüm veriler 30 gün içinde geri döndürülemez şekilde silinir.
            </p>
          </div>
        </div>

        {/* Form Kartı */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginTop: 0, marginBottom: '1.5rem' }}>
            Silme Talebi Formu
          </h2>
          <DeletionFormClient />
        </div>

        {/* Dipnot / İletişim */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#64748b', fontSize: '0.85rem' }}>
          Doğrudan e-posta ile talepte bulunmak isterseniz{' '}
          <a href="mailto:destek@merkurreferans.com.tr" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
            destek@merkurreferans.com.tr
          </a>{' '}
          adresine yazabilirsiniz.
        </div>

      </div>
    </div>
  );
}
