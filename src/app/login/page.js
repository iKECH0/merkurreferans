"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, ShieldCheck, ChevronRight, Sparkles, User, Lock, ArrowLeft } from 'lucide-react';
import { isReferrerRole } from "@/lib/roleConstants";
import "./login.css";

export default function LoginPage() {
  const [selectedPortal, setSelectedPortal] = useState(null); // 'teacher' | 'admin' | null
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
      const withTimeout = (promise, milliseconds) => Promise.race([
        promise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("AUTH_TIMEOUT")), milliseconds);
        })
      ]);

      const res = await withTimeout(signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      }), 10000);

      if (!res?.ok || res?.error) {
        setError("Kullanıcı adı veya şifre hatalı.");
      } else {
        const session = await withTimeout(getSession(), 10000);
        if (!session?.user?.role) {
          throw new Error("SESSION_UNAVAILABLE");
        }

        if (session?.user?.role === 'ADMIN') {
          router.push("/admin");
        } else if (isReferrerRole(session?.user?.role)) {
          router.push("/referrer");
        } else {
          router.push("/student");
        }
        router.refresh();
      }
    } catch (err) {
      setError(err?.message === "AUTH_TIMEOUT" || err?.message === "SESSION_UNAVAILABLE"
        ? "Sunucu yanıt vermedi. İnternet bağlantınızı kontrol edip tekrar deneyin."
        : "Giriş yapılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.05; }
          50% { transform: translateY(-20px) scale(1.1); opacity: 0.1; }
        }
        @keyframes teacherPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes adminPulse {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        .teacher-portal-btn:hover .portal-icon {
          animation: teacherPulse 1.5s infinite;
        }
        .admin-portal-btn:hover .portal-icon {
          animation: adminPulse 1.5s infinite;
        }
      `}} />
      {/* Subtle Background Glows */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none', animation: 'floatGlow 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none', animation: 'floatGlow 8s ease-in-out infinite reverse' }}></div>

      <div style={{ zIndex: 1, width: '100%', maxWidth: '500px', padding: '2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)' }}>
            <Sparkles size={36} color="#38bdf8" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            Merkür Referans
          </h1>
          {!selectedPortal && (
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Platforma giriş yapmak veya kayıt olmak için lütfen profilinizi seçin.
            </p>
          )}
        </div>

        {!selectedPortal ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Teacher / Parent Portal Button */}
            <button 
              className="teacher-portal-btn"
              onClick={() => setSelectedPortal('teacher')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="portal-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Users size={28} />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.3rem' }}>Veli / Öğretmen Girişi</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Ağınızı yönetin, ders verin ve komisyonlarınızı izleyin.</p>
                </div>
              </div>
              <ChevronRight color="#64748b" />
            </button>

            {/* Admin Portal Button */}
            <button 
              className="admin-portal-btn"
              onClick={() => setSelectedPortal('admin')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="portal-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.3rem' }}>Yönetici Girişi</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Sistem ayarları, kullanıcı onayları ve yönetim paneli.</p>
                </div>
              </div>
              <ChevronRight color="#64748b" />
            </button>
          </div>
        ) : (
          <div style={{ animation: 'modalPop 0.4s ease' }}>
            <button 
              onClick={() => { setSelectedPortal(null); setError(""); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', padding: '0.5rem 0' }}
            >
              <ArrowLeft size={18} /> Profil Seçimine Dön
            </button>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${selectedPortal === 'admin' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '2rem', textAlign: 'center' }}>
                {selectedPortal === 'admin' ? 'Yönetici Girişi' : 'Veli / Öğretmen Girişi'}
              </h2>

              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>{error}</div>}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.95rem' }}>Kullanıcı Adı</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Kullanıcı adınızı girin"
                      required
                      style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = selectedPortal === 'admin' ? '#a855f7' : '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.95rem' }}>Şifre</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = selectedPortal === 'admin' ? '#a855f7' : '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: selectedPortal === 'admin' ? 'linear-gradient(to right, #7c3aed, #a855f7)' : 'linear-gradient(to right, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s', opacity: isLoading ? 0.7 : 1 }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
      
      <div style={{ position: 'absolute', bottom: '2rem', textAlign: 'center', width: '100%' }}>
        <p style={{ color: '#38bdf8', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
          Yapay Zeka Destekli Akıllı Asistan
        </p>
      </div>

    </div>
  );
}
