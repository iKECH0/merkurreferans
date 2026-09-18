"use client";

import Link from 'next/link';
import { ArrowRight, Video, CheckCircle2 } from 'lucide-react';
import './globals.css';

export default function ReferansLandingPage() {
  return (
    <div className="landing-wrapper-min">
      
      {/* 1. NAVBAR */}
      <nav className="landing-nav-min">
        <div className="logo-min">
          <span className="logo-icon">🪐</span>
          <span>MERKÜR <span>REFERANS</span></span>
        </div>
        <Link href="/login" className="btn-login-min">
          Giriş
        </Link>
      </nav>

      {/* 2. HERO */}
      <section className="hero-min">
        <div className="hero-glow-orb"></div>
        <div className="hero-glow-orb-2"></div>
        <div className="hero-badge-min">
          <span className="dot"></span> Yeni Nesil Eğitim Platformu
        </div>
        
        <h1 className="hero-title-min">
          Yeni Nesil<br />
          Eğitim Platformu
        </h1>
        
        <p className="hero-desc-min">
          Öğrenci ağınızı kurun, canlı dersler verin, anında kazanın.
        </p>

        <Link href="/register" className="hero-cta-min">
          Ücretsiz Başlayın <ArrowRight size={20} />
        </Link>

        <div className="hero-trust-min">
          <span><CheckCircle2 size={16} color="#10b981" /> Ücretsiz</span>
          <span><CheckCircle2 size={16} color="#10b981" /> Anında Kurulum</span>
          <span><CheckCircle2 size={16} color="#10b981" /> KVKK Uyumlu</span>
        </div>
      </section>

      {/* 3. STATS */}
      <section className="stats-min">
        <div className="stat-item-min">
          <h3>100+</h3>
          <span>Eğitmen</span>
        </div>
        <div className="stat-item-min">
          <h3>5000+</h3>
          <span>Öğrenci</span>
        </div>
        <div className="stat-item-min">
          <h3>⚡</h3>
          <span>Anında Ödeme</span>
        </div>
      </section>

      {/* 4. FEATURES */}
      <section className="feature-min-section">
        <div className="main-feature-card-min">
          <div className="feature-icon-min">
            <Video size={32} />
          </div>
          <h2>HD Zoom Entegrasyonu</h2>
          <p>
            Harici link yok. Tek tıkla, doğrudan platform üzerinden kesintisiz canlı ders deneyimi yaşayın ve öğrencilerinizi güvenle yönetin.
          </p>
        </div>

        <div className="feature-chips-min">
          <span className="chip-min">💰 Şeffaf Cüzdan</span>
          <span className="chip-min">📊 İstatistikler</span>
          <span className="chip-min">📱 Mobil Uygulama</span>
        </div>
      </section>

      {/* 5. MOCKUP (Optional visual context) */}
      <section className="mockup-section-min">
        <div className="mockup-frame-min">
          <div className="mockup-header-min">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <img src="/mockups/referans_mockup_1.jpg" alt="Panel Önizlemesi" />
        </div>
      </section>

      {/* 6. FOOTER CTA */}
      <section className="footer-cta-min">
        <h2>Başlamaya hazır mısınız?</h2>
        
        <Link href="/register" className="hero-cta-min" style={{ marginBottom: 0 }}>
          Ücretsiz Kayıt Ol <ArrowRight size={20} />
        </Link>

        <div className="footer-links-min">
          <Link href="/gizlilikpolitikasi">Gizlilik</Link>
          <Link href="/hesapsilme">Hesap Silme</Link>
          <Link href="/login">Giriş</Link>
        </div>
      </section>

    </div>
  );
}
