import Link from 'next/link';

export const metadata = {
  title: 'Gizlilik Politikası',
  description: 'Merkür Referans Gizlilik Politikası ve Kişisel Verilerin Korunması',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070b14',
      color: '#e2e8f0',
      padding: '40px 20px',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      <div style={{
        maxWidth: '850px',
        margin: '0 auto',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)'
      }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', marginBottom: '28px' }}>
          <Link href="/" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            ← Ana Sayfaya Dön
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc', margin: '8px 0' }}>
            Gizlilik Politikası
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Son Güncelleme: 3 Eylül 2026 | Merkür Referans
          </p>
        </div>

        {/* Content */}
        <div style={{ lineHeight: '1.75', fontSize: '0.95rem', color: '#cbd5e1' }}>
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '10px' }}>
              1. Giriş ve Genel Bakış
            </h2>
            <p>
              <strong>Merkür Referans</strong> (&quot;Platform&quot;, &quot;Uygulama&quot; veya &quot;Biz&quot;) olarak, kullanıcılarımızın kişisel verilerinin gizliliğine ve güvenliğine en üst düzeyde önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ve mobil uygulamamızı kullanan öğrencilerin, eğitmenlerin ve velilerin verilerinin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '10px' }}>
              2. Toplanan Kişisel Veriler
            </h2>
            <p>Platformumuzda hesap oluştururken ve eğitim hizmetlerinden yararlanırken aşağıdaki verileriniz işlenebilir:</p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
              <li><strong>Hesap ve Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı, şifrelenmiş parola (bcrypt).</li>
              <li><strong>İletişim Bilgileri:</strong> Telefon numarası (opsiyonel bildirim ve doğrulama için).</li>
              <li><strong>Eğitim ve Performans Verileri:</strong> Canlı ders katılımları, egzersiz kayıtları, süreler ve skorlar.</li>
              <li><strong>Finansal Bilgiler (Sadece Eğitmenler için):</strong> Hak ediş ve komisyon ödemelerinin yapılabilmesi için banka IBAN bilgileri.</li>
              <li><strong>Cihaz ve Bağlantı Verileri:</strong> Güvenlik amacıyla IP adresi, işletim sistemi ve uygulama versiyonu.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '10px' }}>
              3. Verilerin Kullanım Amaçları
            </h2>
            <p>Toplanan kişisel bilgileriniz yalnızca aşağıdaki amaçlar doğrultusunda kullanılır:</p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
              <li>Kullanıcı hesaplarının oluşturulması ve kimlik doğrulama,</li>
              <li>Öğretmen ve öğrenciler arasında canlı derslerin planlanması ve yürütülmesi,</li>
              <li>Abonelik paketlerinin ve referans komisyonlarının hesaplanıp yönetilmesi,</li>
              <li>Teknik destek ve platform güvenliğinin sağlanması.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '10px' }}>
              4. Üçüncü Taraf Hizmetler ve Veri Paylaşımı
            </h2>
            <p>
              Kişisel verileriniz <strong>kesinlikle üçüncü taraf reklam şirketlerine satılmaz veya pazarlama amacıyla paylaşılmaz</strong>. Hizmetlerin kesintisiz sunulabilmesi adına yalnızca güvenilir altyapı sağlayıcılarıyla entegrasyon sağlanır:
            </p>
            <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
              <li><strong>Zoom Video Communications:</strong> Canlı ders bağlantılarının oluşturulması için Zoom API kullanılmaktadır.</li>
              <li><strong>Bulut Sunucuları ve Veritabanı:</strong> Veriler güvenli, şifrelenmiş PostgreSQL veritabanı altyapısında saklanmaktadır.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '10px' }}>
              5. Veri Güvenliği
            </h2>
            <p>
              Tüm veri transferleri <strong>SSL/TLS (HTTPS)</strong> şifreleme protokolleri ile güvence altına alınmıştır. Parolalarınız veritabanında salt metin olarak asla tutulmaz, tek yönlü kriptografik algoritmalarla (hash) korunur.
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '10px' }}>
              6. Kullanıcı Hakları ve Hesap Silme (Google Play Uyumlu)
            </h2>
            <p>
              Kullanıcılarımız 6698 sayılı KVKK ve Google Play politikaları kapsamında; verilerini görüntüleme, düzeltme veya <strong>hesaplarını ve tüm ilişkili verilerini kalıcı olarak sildirme</strong> hakkına sahiptir.
            </p>
            <div style={{ marginTop: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px 18px', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#f8fafc', fontSize: '0.95rem' }}>
                Hesabınızı ve kişisel verilerinizi kalıcı olarak silmek için web sitemiz üzerinden hemen talep oluşturabilirsiniz:{' '}
                <a href="/hesapsilme" style={{ color: '#f87171', fontWeight: 600, textDecoration: 'underline' }}>
                  Hesap ve Veri Silme Talebi Sayfası →
                </a>
              </p>
            </div>
          </section>

          <section style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '600', marginBottom: '10px' }}>
              7. İletişim
            </h2>
            <p>
              Gizlilik politikamız veya kişisel verilerinizle ilgili her türlü soru ve talepleriniz için:
            </p>
            <p style={{ marginTop: '6px', color: '#f8fafc' }}>
              🌐 Web: <a href="https://merkurreferans.com.tr" style={{ color: '#10b981' }}>https://merkurreferans.com.tr</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
