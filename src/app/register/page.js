"use client";

import { useState, useEffect, Suspense } from "react";
import { registerStudent } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "../login/login.css";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [requestedMonths, setRequestedMonths] = useState("1");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("phone", phone);
    formData.append("referralCode", referralCode);
    formData.append("requestedMonths", requestedMonths);

    const res = await registerStudent(formData);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <div className="login-box glass-panel tilt-effect" style={{ width: '100%' }}>
      <div className="login-header">
        <h2>Aramıza Katıl</h2>
        <p>Merkür Referans eğitim serüvenine başlamak için kayıt olun.</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {success ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>Kayıt Başarılı!</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Hesabınız oluşturuldu. Yönetici onayının ardından eğitimlerinize başlayabileceksiniz. Giriş sayfasına yönlendiriliyorsunuz...
          </p>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label>Ad Soyad</label>
            <input 
              type="text" 
              className="input-field" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz"
              disabled={isLoading}
              required 
            />
          </div>

          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Sisteme girerken kullanacağınız ad"
              disabled={isLoading}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Telefon Numarası</label>
            <input 
              type="tel" 
              className="input-field" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Örn: 0555 555 5555"
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

          <div className="form-group">
            <label>Eğitim Paketi (Süresi)</label>
            <select 
              className="input-field" 
              value={requestedMonths}
              onChange={(e) => setRequestedMonths(e.target.value)}
              disabled={isLoading}
              required
              style={{ appearance: 'auto', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
            >
              <option value="1" style={{ color: 'black' }}>1 Ay (Standart)</option>
              <option value="3" style={{ color: 'black' }}>3 Ay</option>
              <option value="6" style={{ color: 'black' }}>6 Ay</option>
              <option value="12" style={{ color: 'black' }}>1 Yıl (12 Ay)</option>
            </select>
          </div>

          <div className="form-group" style={{ display: referralCode ? 'block' : 'none' }}>
            <label>Referans Kodu</label>
            <input 
              type="text" 
              className="input-field" 
              value={referralCode} 
              onChange={(e) => setReferralCode(e.target.value)}
              disabled={true}
            />
            <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.3rem' }}>
              Özel davet bağlantısı ile geldiniz.
            </p>
          </div>

          <button type="submit" className="pulse-btn login-btn" disabled={isLoading} style={{ width: '100%', marginTop: '1rem', opacity: isLoading ? 0.8 : 1 }}>
            {isLoading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            Zaten hesabınız var mı? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Giriş Yap</Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="login-wrapper">
      {/* VERTICAL FALLING STARS */}
      <div className="falling-star star-1"></div>
      <div className="falling-star star-2"></div>
      <div className="falling-star star-3"></div>
      <div className="falling-star star-4"></div>

      <div className="login-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '500px', margin: '0 auto' }}>
          <Suspense fallback={
            <div className="login-box glass-panel" style={{ width: '100%', textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Sayfa yükleniyor...</p>
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
