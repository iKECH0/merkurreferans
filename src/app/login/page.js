"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap, Presentation, ChevronRight, Sparkles, User, Lock, ArrowLeft } from 'lucide-react';
import "./login.css";

export default function LoginPage() {
  const [selectedPortal, setSelectedPortal] = useState(null); // 'student' | 'teacher' | null
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', position: 'relative', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Subtle Background Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'rgba(56, 189, 248, 0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', background: 'rgba(16, 185, 129, 0.05)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

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
            {/* Student Portal Button */}
            <button 
              onClick={() => setSelectedPortal('student')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.3rem' }}>Öğrenci Portalı</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Canlı derslerinize katılın ve gelişiminizi takip edin.</p>
                </div>
              </div>
              <ChevronRight color="#64748b" />
            </button>

            {/* Teacher/Referrer Portal Button */}
            <button 
              onClick={() => setSelectedPortal('teacher')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Presentation size={28} />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.3rem' }}>Bayi / Eğitmen Portalı</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Ağınızı yönetin, ders verin ve komisyonlarınızı izleyin.</p>
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
            
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${selectedPortal === 'student' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '2rem', textAlign: 'center' }}>
                {selectedPortal === 'student' ? 'Öğrenci Girişi' : 'Öğretmen / Bayi Girişi'}
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
                      onFocus={(e) => e.target.style.borderColor = selectedPortal === 'student' ? '#38bdf8' : '#10b981'}
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
                      onFocus={(e) => e.target.style.borderColor = selectedPortal === 'student' ? '#38bdf8' : '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: selectedPortal === 'student' ? 'linear-gradient(to right, #0284c7, #38bdf8)' : 'linear-gradient(to right, #059669, #10b981)', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s', opacity: isLoading ? 0.7 : 1 }}
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
