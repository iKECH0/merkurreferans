"use client";
import { useState } from "react";
import { resetStudentPassword } from "./actions";

export default function ResetPasswordClient({ student }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Şifre en az 4 karakter olmalıdır.' });
      return;
    }
    
    setLoading(true);
    const res = await resetStudentPassword(student.id, newPassword);
    setLoading(false);
    
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi.' });
      setNewPassword("");
      setTimeout(() => setIsOpen(false), 1500);
    }
  };

  return (
    <>
      <button 
        className="btn-sm" 
        style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', cursor: 'pointer' }}
        onClick={() => setIsOpen(true)}
      >
        x Şifre
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Şifre Sıfırla</h3>
              <button type="button" className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <strong>{student.name}</strong> ({student.username}) için yeni şifre belirleyin.
            </p>

            {message && (
              <div style={{ padding: '0.8rem', marginBottom: '1rem', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? '#ef4444' : '#10b981', borderRadius: '8px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Yeni Şifre" 
                className="input-field"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
