"use client";
import { useState } from "react";
import { addStudent } from "./actions";

export default function AddStudentClient({ teachers }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const formData = new FormData(e.target);
    const result = await addStudent(formData);
    
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      e.target.reset();
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        + Yeni Öğrenci Ekle
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Yeni Öğrenci Kaydı</h3>
              <button type="button" className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Öğrenci Adı Soyadı</label>
                <input type="text" name="name" className="input-field" required placeholder="Ali Yılmaz" />
              </div>
              <div className="form-group">
                <label>Sisteme Giriş Kullanıcı Adı</label>
                <input type="text" name="username" className="input-field" required placeholder="ali123" />
              </div>
              <div className="form-group">
                <label>Giriş Şifresi</label>
                <input type="text" name="password" className="input-field" required placeholder="Şifre belirleyin" />
              </div>
              <div className="form-group">
                <label>Atanmış Öğretmen</label>
                <select name="assignedTeacherId" className="input-field">
                  <option value="">Daha sonra atanacak</option>
                  {teachers?.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name || teacher.username}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Abonelik Süresi</label>
                <select name="subscriptionMonths" className="input-field" style={{ cursor: 'pointer' }} required>
                  <option value="1">1 Aylık</option>
                  <option value="3">3 Aylık</option>
                  <option value="6">6 Aylık</option>
                  <option value="12">1 Yıllık</option>
                  <option value="999">Sınırsız (Ömür Boyu)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsOpen(false)}>İptal</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Öğrenciyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
