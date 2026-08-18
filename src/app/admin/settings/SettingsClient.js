"use client";
import { useState } from "react";
import { updateSettings, updateAdminCredentials } from "./actions";

export default function SettingsClient({ currentSettings }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const res = await updateSettings(formData);
    setLoading(false);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Ayarlar başarıyla kaydedildi!" });
      setTimeout(() => setMessage(null), 3000);
    }
  };


  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Sistem Ayarları & Duyuru</h3>
      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? '#ef4444' : '#10b981', border: message.type === 'error' ? '1px solid #ef4444' : '1px solid #10b981' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Kurum Adı</label>
          <input 
            type="text" 
            name="institutionName" 
            defaultValue={currentSettings?.institutionName || "MERKÜR REFERANS"} 
            className="input-field" 
            required 
            placeholder="Örn: X Akademi"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Logo URL</label>
          <input 
            type="url" 
            name="logoUrl" 
            defaultValue={currentSettings?.logoUrl || ""} 
            className="input-field" 
            placeholder="Örn: https://siteniz.com/logo.png"
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Bu logo URL'si, öğrenci gelişim karnelerinin (PDF) en üstünde çıkacaktır. Sadece geçerli bir resim linki giriniz.
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Abonelik Referans Komisyonu (₺)</label>
          <input 
            type="number" 
            name="commissionRate" 
            defaultValue={currentSettings?.commissionRate || 15.0} 
            className="input-field" 
            step="0.01"
            required 
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Öğrenci abonelik paketini aldığında doğrudan davet edene gidecek standart tutar.
          </p>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ marginBottom: '1rem', color: '#10b981' }}>Özel Ders Komisyon Yüzdeleri (%)</h4>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>Senaryo A: Kurum Öğrencisi - Öğretmen Payı (%)</label>
            <input type="number" name="lessonTeacherShareA" defaultValue={currentSettings?.lessonTeacherShareA || 50.0} className="input-field" step="0.1" required />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Öğrenciyi akademi getirdiyse öğretmenin alacağı pay.</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>Senaryo B: Öğretmen Öğrencisi - Öğretmen Payı (%)</label>
            <input type="number" name="lessonTeacherShareB" defaultValue={currentSettings?.lessonTeacherShareB || 65.0} className="input-field" step="0.1" required />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Öğretmen öğrenciyi kendi getirdiyse alacağı pay.</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>Lider Öğretmen Pasif Payı (%)</label>
            <input type="number" name="leaderTeacherShare" defaultValue={currentSettings?.leaderTeacherShare || 10.0} className="input-field" step="0.1" required />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Referansı sisteme katan Lider Öğretmenin, o referansın verdiği derslerden alacağı pasif pay.</p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>Veli Tavsiye (Cüzdan Puanı) Payı (%)</label>
            <input type="number" name="parentReferralBonus" defaultValue={currentSettings?.parentReferralBonus || 15.0} className="input-field" step="0.1" required />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Veli başka veliyi getirdiğinde cüzdanına yansıyacak puan oranı.</p>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Genel Duyuru (Tüm Öğrenciler Görür)</label>
          <textarea 
            name="announcement" 
            defaultValue={currentSettings?.announcement || ""} 
            className="input-field" 
            rows="3"
            placeholder="Örn: Bu haftanın birincisi Ahmet oldu! Tebrikler!"
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
          {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Yönetici Giriş Bilgileri</h3>
        <form action={async (formData) => {
          setLoading(true);
          const res = await updateAdminCredentials(formData);
          setLoading(false);
          if (res.error) {
            setMessage({ type: "error", text: res.error });
          } else {
            setMessage({ type: "success", text: "Yönetici bilgileri başarıyla güncellendi! Bir sonraki girişte yeni şifrenizi kullanın." });
            setTimeout(() => setMessage(null), 5000);
          }
        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Kullanıcı Adı</label>
            <input 
              type="text" 
              name="username" 
              className="input-field" 
              required 
              placeholder="Yeni kullanıcı adı"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Yeni Şifre</label>
            <input 
              type="password" 
              name="password" 
              className="input-field" 
              placeholder="Değiştirmek istemiyorsanız boş bırakın"
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Şifrenizi değiştirmek için en az 6 karakterli yeni bir şifre girin. Değiştirmek istemiyorsanız burayı boş bırakabilirsiniz.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
            {loading ? "Kaydediliyor..." : "Giriş Bilgilerini Güncelle"}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Veri Yedekleme (JSON)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Sistemdeki tüm öğrenci kayıtlarını, şifreleri ve skorları bilgisayarınıza indirip güvenle saklayabilirsiniz.
          </p>
          <a href="/api/backup" download className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', background: '#10b981', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
            ⬇️ Tüm Verileri İndir (.json)
          </a>
        </div>
      </div>
    </div>
  );
}
