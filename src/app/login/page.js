"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setError("Kullanıcı adı veya şifre hatalı.");
      } else {
        const session = await getSession();
        if (session?.user?.role === 'ADMIN') {
          router.push("/admin");
        } else if (['REFERRER', 'TEACHER', 'LEADER_TEACHER', 'PARENT'].includes(session?.user?.role)) {
          router.push("/referrer");
        } else {
          router.push("/student");
        }
        router.refresh();
      }
    } catch (err) {
      setError("Giriş yapılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      

      
      {/* VERTICAL FALLING STARS */}
      <div className="falling-star star-1"></div>
      <div className="falling-star star-2"></div>
      <div className="falling-star star-3"></div>
      <div className="falling-star star-4"></div>

      <div className="login-grid">
        
        {/* LEFT SIDE - BRANDING & TYPOGRAPHY */}
        <div className="login-info-section">
          <h1 className="info-title">MERKÜR REFERANS</h1>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
            Canlı Ders ve Referans Paneli
          </h2>
          <p className="info-subtitle typewriter" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
            "Ağınızı büyütün, kazanmaya başlayın."
          </p>
          
          <div className="info-features">
            <div className="feature-item" style={{ padding: '0.8rem 1.2rem' }}>
              <span className="feature-icon" style={{ fontSize: '1.5rem', width: '40px', height: '40px' }}>✅</span>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Canlı Ders Yönetimi</h3>
              </div>
            </div>
            <div className="feature-item" style={{ padding: '0.8rem 1.2rem' }}>
              <span className="feature-icon" style={{ fontSize: '1.5rem', width: '40px', height: '40px' }}>✅</span>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Referans ve Ekip Ağı</h3>
              </div>
            </div>
            <div className="feature-item" style={{ padding: '0.8rem 1.2rem' }}>
              <span className="feature-icon" style={{ fontSize: '1.5rem', width: '40px', height: '40px' }}>✅</span>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Komisyon Takibi</h3>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '3rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '500', textAlign: 'center', letterSpacing: '0.5px' }}>
              "Eğitimin Yeni Nesil Yönetim Platformu"
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="login-form-section">
          <div className="login-box glass-panel tilt-effect">
            <div className="login-header">
              <h2>Sisteme Giriş</h2>
              <p>Öğrenci, Referans veya Yönetici bilgilerinizle girin.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Kullanıcı Adı</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Örn: ahmet123"
                  disabled={isLoading}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Şifre</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
                  disabled={isLoading}
                  required 
                />
              </div>

              <button type="submit" className="pulse-btn login-btn" disabled={isLoading} style={{ width: '100%', marginTop: '1rem', opacity: isLoading ? 0.8 : 1 }}>
                {isLoading ? (
                  <>
                    <span className="spinner-icon">⏳</span> Giriş Yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
