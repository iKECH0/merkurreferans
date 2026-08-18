"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Video, 
  Wallet, 
  BarChart3, 
  ArrowRight, 
  Share2, 
  PlayCircle, 
  Banknote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './globals.css';

export default function ReferansLandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Sisteme referans/eğitmen olarak kayıt olmak ücretli mi?",
      answer: "Hayır, Merkür Referans platformuna eğitmen veya referans olarak katılmak tamamen ücretsizdir. Kurulum ücreti veya aylık aidat alınmaz."
    },
    {
      question: "Komisyonlar nasıl hesaplanıyor ve ödeniyor?",
      answer: "Komisyonlarınız, öğrencinizin kayıt olduğu paket ve verdiğiniz canlı dersler üzerinden otomatik hesaplanır. Hakedişleriniz anında cüzdanınıza yansır ve haftalık olarak banka hesabınıza transfer edilir."
    },
    {
      question: "Kendi öğrencilerime canlı ders verebilir miyim?",
      answer: "Kesinlikle! Sistemimizdeki entegre HD Zoom altyapısını kullanarak kendi öğrencilerinize (veya sistemdeki diğer öğrencilere) anında canlı ders planlayabilirsiniz."
    },
    {
      question: "Alt referans (Asistan Eğitmen) ekleyebilir miyim?",
      answer: "Evet, kendi zümrenizi veya asistan eğitmen ağınızı kurabilirsiniz. Onların verdiği derslerden de pasif gelir elde etme şansına sahip olursunuz."
    }
  ];

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
      
      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span style={{ color: 'var(--primary)' }}>🪐 MERKÜR</span> REFERANS
        </div>
        <div className="landing-nav-buttons">
          <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>Sisteme Giriş</Link>
          <Link href="/register" className="btn-primary" style={{ textDecoration: 'none', background: '#10b981', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>
            Hemen Başla
          </Link>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section style={{ padding: '8rem 5% 5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: '#10b981', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', color: '#34d399', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <Users size={16} /> Eğitmen & Bayi Ağına Katılın
        </div>
        
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', maxWidth: '900px' }}>
          Eğitimin Yeni Referans Noktası
        </h1>
        
        <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '3rem', lineHeight: '1.6' }}>
          Kendi öğrenci ağınızı kurun, profesyonel panelle canlı dersler verin ve şeffaf komisyon modeliyle kazancınızı anında katlayın.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/register" className="btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: '#10b981', color: '#fff', border: 'none' }}>
            Ağınızı Kurmaya Başlayın <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section style={{ padding: '3rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>100<span style={{color: '#10b981'}}>+</span></h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Aktif Eğitmen</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>5000<span style={{color: 'var(--primary)'}}>+</span></h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Memnun Öğrenci</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Anında</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Komisyon Dağıtımı</p>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section style={{ padding: '6rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Neden Merkür?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Platformumuz, eğitmenlerin ve danışmanların işini kolaylaştırmak için tasarlandı.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', transition: 'transform 0.3s' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1.5rem' }}>
              <Video size={30} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-main)' }}>HD Zoom Entegrasyonu</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Sisteme gömülü Zoom altyapısı sayesinde harici hiçbir uygulama kullanmadan, tek tıkla profesyonel canlı dersler başlatın.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', transition: 'transform 0.3s' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.5rem' }}>
              <Wallet size={30} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Şeffaf Komisyon Ağı</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Karmaşık senaryolara son. Verdiğiniz derslerden ve yönlendirdiğiniz öğrencilerden elde ettiğiniz kazancı anlık olarak cüzdanınızda görün.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', transition: 'transform 0.3s' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(167, 139, 250, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '1.5rem' }}>
              <BarChart3 size={30} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Gelişmiş İstatistikler</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Tüm öğrencilerinizin deneme netlerini, okuma hızlarını ve platform içi aktivitelerini detaylı analiz raporlarıyla tek ekrandan takip edin.</p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section style={{ padding: '6rem 5%', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Nasıl Çalışır?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>3 basit adımda kendi dijital sınıfınızı ve ağınızı kurun.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
          
          <div style={{ flex: '1', minWidth: '250px', textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}>
              <Share2 size={35} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>1. Linkini Paylaş</h3>
            <p style={{ color: 'var(--text-muted)' }}>Sana özel davet bağlantını velilerle veya öğrencilerle paylaş.</p>
          </div>

          <div style={{ flex: '1', minWidth: '250px', textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}>
              <PlayCircle size={35} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>2. Dersini Yap</h3>
            <p style={{ color: 'var(--text-muted)' }}>Panel üzerinden dersini planla ve anında HD yayına başla.</p>
          </div>

          <div style={{ flex: '1', minWidth: '250px', textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
              <Banknote size={35} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>3. Anında Kazan</h3>
            <p style={{ color: 'var(--text-muted)' }}>Ders bittiği saniye hakedişin otomatik olarak cüzdanına yansısın.</p>
          </div>

        </div>
      </section>

      {/* 5. MOCKUPS SECTION */}
      <section style={{ padding: '6rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Geleceğin Yönetim Paneli</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Eğitmenlere ve yöneticilere özel tasarlanmış modern arayüz ile tanışın.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', maxWidth: '1200px', margin: '0 auto', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ flex: '1', minWidth: '350px', padding: '1rem', borderRadius: '20px', overflow: 'hidden' }}>
            <img src="/mockups/referans_mockup_1.jpg" alt="Analytics Dashboard Mockup" style={{ width: '100%', borderRadius: '15px', objectFit: 'cover' }} />
          </div>
          <div className="glass-panel" style={{ flex: '1', minWidth: '350px', padding: '1rem', borderRadius: '20px', overflow: 'hidden' }}>
            <img src="/mockups/referans_mockup_2.jpg" alt="Wallet & Schedule Dashboard Mockup" style={{ width: '100%', borderRadius: '15px', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section style={{ padding: '5rem 5%', background: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>Sıkça Sorulan Sorular</h2>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div key={index} className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => toggleFaq(index)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', color: openFaq === index ? '#10b981' : 'var(--text-main)', margin: 0, fontWeight: '600' }}>
                  {faq.question}
                </h4>
                {openFaq === index ? <ChevronUp color="#10b981" /> : <ChevronDown color="var(--text-muted)" />}
              </div>
              {openFaq === index && (
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA & FOOTER */}
      <section style={{ padding: '6rem 5% 3rem', textAlign: 'center', background: 'linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.05))' }}>
        <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '1.5rem', fontWeight: '800' }}>Kendi ağınızı kurmaya hazır mısınız?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>Hemen kayıt olun ve kazancınızı Merkür Referans güvencesiyle katlayın.</p>
        
        <Link href="/register" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', textDecoration: 'none', background: '#10b981', color: '#fff', border: 'none', display: 'inline-block', marginBottom: '5rem' }}>
          Ücretsiz Kayıt Ol
        </Link>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', gap: '2rem' }}>
          <div style={{ textAlign: 'left' }}>
            <div className="landing-logo" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--primary)' }}>🪐 MERKÜR</span> REFERANS
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Eğitimin Yeni Referans Noktası &copy; 2026</p>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Gizlilik Politikası</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Kullanım Koşulları</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>İletişim</a>
          </div>
        </div>
      </section>

    </div>
  );
}
