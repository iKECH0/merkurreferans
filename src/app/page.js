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
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Smartphone,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import './globals.css';

export default function ReferansLandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Sisteme referans veya eğitmen olarak kayıt olmak ücretli mi?",
      answer: "Hayır, Merkür Referans platformuna eğitmen, veli veya referans olarak katılmak tamamen ücretsizdir. Herhangi bir kurulum ücreti veya aidat alınmaz."
    },
    {
      question: "Komisyonlar ve hakedişler nasıl hesaplanır ve ödenir?",
      answer: "Öğrencilerinizin kayıt olduğu paketler ve gerçekleştirdiğiniz canlı dersler üzerinden hakedişler otomatik hesaplanır. Ders tamamlandığı anda kazancınız cüzdanınıza yansır ve banka hesabınıza aktarılabilir."
    },
    {
      question: "Kendi öğrencilerime doğrudan canlı ders verebilir miyim?",
      answer: "Kesinlikle! Sistemimizdeki entegre HD Zoom altyapısıyla harici programlara gerek kalmadan tek tıkla canlı ders başlatabilir, öğrencinizin katılım durumunu anlık takip edebilirsiniz."
    },
    {
      question: "Mobil cihazlardan ve Android uygulamadan erişebilir miyim?",
      answer: "Evet! Merkür Referans hem web tarayıcılarından hem de Google Play Store'da yer alan resmi mobil uygulamamızdan kesintisiz şekilde 7/24 kullanılabilir."
    },
    {
      question: "Alt referans veya asistan eğitmen ağı kurabilir miyim?",
      answer: "Evet! Kendi referans bağlantınızı paylaşarak zümrenizi veya eğitmen ağınızı büyütebilir, ekibinizin gerçekleştirdiği derslerden de ek referans geliri elde edebilirsiniz."
    }
  ];

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
      
      {/* 1. NAVBAR */}
      <nav className="landing-nav" style={{
        background: 'rgba(7, 10, 19, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)'
          }}>
            🪐
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MERKÜR</span>{' '}
            <span style={{ color: '#f8fafc' }}>REFERANS</span>
          </span>
        </div>

        <div className="landing-nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/login" className="btn-secondary" style={{
            textDecoration: 'none',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#f8fafc',
            transition: 'all 0.2s'
          }}>
            Sisteme Giriş
          </Link>
          <Link href="/register" style={{
            textDecoration: 'none',
            padding: '0.65rem 1.35rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            Hemen Başla
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={{
        padding: '5.5rem 5% 4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '450px', height: '450px', background: '#8b5cf6', filter: 'blur(160px)', opacity: 0.16, borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '450px', height: '450px', background: '#10b981', filter: 'blur(160px)', opacity: 0.16, borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '350px', height: '350px', background: '#06b6d4', filter: 'blur(180px)', opacity: 0.12, borderRadius: '50%', pointerEvents: 'none' }}></div>

        {/* Badge */}
        <div className="hero-badge">
          <span className="hero-pulse-dot"></span>
          <span>Eğitmen & Referans Ağına Katılın</span>
        </div>
        
        {/* Başlık */}
        <h1 className="hero-title">
          Eğitimin Yeni<br />
          Referans Noktası
        </h1>
        
        {/* Açıklama */}
        <p className="hero-desc">
          Kendi öğrenci ağınızı kurun, profesyonel yönetim paneliyle canlı dersler verin ve şeffaf referans modeliyle kazancınızı güvenle katlayın.
        </p>

        {/* CTA Butonları */}
        <div className="cta-buttons-wrap" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginBottom: '2.5rem' }}>
          <Link href="/register" className="pulse-btn" style={{
            padding: '1.1rem 2.5rem',
            fontSize: '1.1rem',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            Ağınızı Kurmaya Başlayın <ArrowRight size={20} />
          </Link>
          
          <a href="#nasil-calisir" style={{
            padding: '1.1rem 2rem',
            fontSize: '1.05rem',
            fontWeight: 600,
            textDecoration: 'none',
            color: '#f8fafc',
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s'
          }}>
            <PlayCircle size={20} style={{ color: '#38bdf8' }} /> Nasıl Çalışır?
          </a>
        </div>

        {/* Güven Rozetleri */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Entegre HD Zoom
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} style={{ color: '#38bdf8' }} /> Anında Otomatik Hakediş
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} style={{ color: '#a78bfa' }} /> KVKK & Google Play Uyumlu
          </span>
        </div>
      </section>

      {/* 3. İSTATİSTİKLER (3'lü Kart Tasarımı) */}
      <section style={{
        padding: '3rem 5%',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="stats-cards-grid">
          
          <div className="stat-card-modern">
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <GraduationCap size={24} />
            </div>
            <h3 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.3rem 0', lineHeight: 1 }}>
              100<span style={{ color: '#10b981' }}>+</span>
            </h3>
            <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1.05rem', margin: '0 0 0.25rem 0' }}>
              Aktif Eğitmen & Danışman
            </p>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Türkiye genelinde büyüyen eğitim ağı</span>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.3rem 0', lineHeight: 1 }}>
              5000<span style={{ color: '#a78bfa' }}>+</span>
            </h3>
            <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1.05rem', margin: '0 0 0.25rem 0' }}>
              Memnun Öğrenci
            </p>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Aktif canlı ders ve referans takibi</span>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Banknote size={24} />
            </div>
            <h3 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.3rem 0', lineHeight: 1 }}>
              Anında
            </h3>
            <p style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1.05rem', margin: '0 0 0.25rem 0' }}>
              Komisyon Dağıtımı
            </p>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Ders bittiği an cüzdana doğrudan aktarım</span>
          </div>

        </div>
      </section>

      {/* 4. ÖZELLİKLER (NEDEN MERKÜR?) */}
      <section style={{ padding: '6rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            <Sparkles size={16} /> Ayrıcalıklar
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.75rem 0' }}>
            Neden Merkür Referans?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Eğitmenlerin, velilerin ve yöneticilerin tüm süreçlerini tek çatı altında kolaylaştırmak için tasarlandı.
          </p>
        </div>

        <div className="features-grid-modern">
          
          <div className="feature-card-modern">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1.5rem' }}>
              <Video size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Entegre HD Zoom Altyapısı
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
              Harici karmaşık linklerle uğraşmaya son. Sisteme doğrudan gömülü profesyonel Zoom bağlantısı sayesinde tek tıkla ders başlatın ve katılın.
            </p>
          </div>

          <div className="feature-card-modern">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.5rem' }}>
              <Wallet size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Şeffaf & Otomatik Cüzdan
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
              Verdiğiniz derslerden ve yönlendirdiğiniz öğrencilerden hak kazandığınız komisyonları saniyesinde cüzdanınızda görün ve güvenle çekin.
            </p>
          </div>

          <div className="feature-card-modern">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(167, 139, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '1.5rem' }}>
              <BarChart3 size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Gelişmiş Öğrenci & Ağ Analitiği
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
              Öğrencilerinizin ders devamlılığını, deneme netlerini ve referans hiyerarşinizi tek bir şık panelden detaylı grafiklerle takip edin.
            </p>
          </div>

          <div className="feature-card-modern">
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '1.5rem' }}>
              <Smartphone size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Resmi Mobil Uygulama Deneyimi
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
              Google Play uyumlu resmi Android uygulamamız sayesinde telefonunuzdan her bildirimden anında haberdar olun ve derslerinizi cebinizden yönetin.
            </p>
          </div>

        </div>
      </section>

      {/* 5. NASIL ÇALIŞIR? */}
      <section id="nasil-calisir" style={{
        padding: '6rem 5%',
        background: 'rgba(15, 23, 42, 0.35)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.75rem 0' }}>
            3 Basit Adımda Başlayın
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
            Dakikalar içinde kendi dijital sınıfınızı ve referans ağınızı kurun.
          </p>
        </div>

        <div className="steps-grid-modern">
          
          <div className="step-card-modern">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#8b5cf6',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }}>
              01
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Linkini Paylaş</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Sana özel referans bağlantını öğrencilerle veya velilerle paylaşarak ağını kur.
            </p>
          </div>

          <div className="step-card-modern">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#3b82f6',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }}>
              02
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Canlı Dersini Ver</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Panel üzerinden dersini saniyeler içinde planla ve doğrudan HD canlı yayına başla.
            </p>
          </div>

          <div className="step-card-modern">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
            }}>
              03
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Anında Kazan</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Ders tamamlandığı an hakedişin otomatik olarak cüzdanına yansısın.
            </p>
          </div>

        </div>
      </section>

      {/* 6. PANEL ÖNİZLEMESİ (MOCKUPS) */}
      <section style={{ padding: '6rem 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.75rem 0' }}>
            Geleceğin Yönetim Paneli
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
            Eğitmenler ve yöneticiler için titizlikle hazırlanmış modern arayüz ile tanışın.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px -15px rgba(0,0,0,0.7)'
          }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }}></span>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }}></span>
              <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>merkurreferans.com.tr/panel/analitik</span>
            </div>
            <img src="/mockups/referans_mockup_1.jpg" alt="Analytics Dashboard Mockup" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px -15px rgba(0,0,0,0.7)'
          }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }}></span>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }}></span>
              <span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>merkurreferans.com.tr/panel/cuzdan</span>
            </div>
            <img src="/mockups/referans_mockup_2.jpg" alt="Wallet & Schedule Dashboard Mockup" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
          </div>

        </div>
      </section>

      {/* 7. SSS (FAQ) */}
      <section style={{
        padding: '5rem 5%',
        background: 'rgba(15, 23, 42, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#f8fafc' }}>
            Sıkça Sorulan Sorular
          </h2>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div key={index} className="glass-panel" style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s', borderRadius: '12px' }} onClick={() => toggleFaq(index)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', color: openFaq === index ? '#10b981' : '#f8fafc', margin: 0, fontWeight: 600 }}>
                  {faq.question}
                </h4>
                {openFaq === index ? <ChevronUp color="#10b981" /> : <ChevronDown color="#64748b" />}
              </div>
              {openFaq === index && (
                <p style={{ marginTop: '0.85rem', color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem', margin: '0.85rem 0 0 0' }}>
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. CTA VE FOOTER */}
      <section style={{
        padding: '6rem 5% 3rem',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '3.5rem 2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(16px)',
          marginBottom: '5rem'
        }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', marginBottom: '1rem', fontWeight: 800 }}>
            Kendi Ağınızı Kurmaya Hazır mısınız?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.15rem', marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
            Hemen ücretsiz kaydolun ve eğitiminizi Merkür Referans güvencesiyle geleceğe taşıyın.
          </p>
          
          <Link href="/register" className="pulse-btn" style={{
            padding: '1.15rem 3.5rem',
            fontSize: '1.15rem',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            borderRadius: '12px',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.45)'
          }}>
            Ücretsiz Kayıt Ol <ArrowRight size={20} />
          </Link>
        </div>

        {/* Footer Linkleri */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '1.5rem'
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🪐</span>
              <span style={{ color: '#a78bfa' }}>MERKÜR</span>
              <span style={{ color: '#f8fafc' }}>REFERANS</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
              Eğitimin Yeni Referans Noktası &copy; 2026 Tüm Hakları Saklıdır.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
            <Link href="/gizlilikpolitikasi" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>
              Gizlilik Politikası
            </Link>
            <Link href="/hesapsilme" style={{ color: '#ef4444', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}>
              Hesap Silme Talebi
            </Link>
            <Link href="/login" style={{ color: '#38bdf8', textDecoration: 'none', transition: 'color 0.2s' }}>
              Sisteme Giriş
            </Link>
            <Link href="/register" style={{ color: '#10b981', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 600 }}>
              Kayıt Ol
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
