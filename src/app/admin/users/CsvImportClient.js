"use client";
import { useState } from "react";
import Papa from "papaparse";
import { addMultipleStudents } from "./actions";

export default function CsvImportClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        if (data.length === 0) {
          setMessage("Dosya boş veya format hatalı.");
          setLoading(false);
          return;
        }

        // Validate headers (expecting at least username and password)
        const firstRow = data[0];
        if (!firstRow.hasOwnProperty('username') || !firstRow.hasOwnProperty('password')) {
          setMessage("Hata: CSV dosyasında 'username' ve 'password' başlıkları (sütunları) zorunludur.");
          setLoading(false);
          return;
        }

        const response = await addMultipleStudents(data);
        if (response.error) {
          setMessage(response.error);
        } else {
          setMessage(`✅ Başarıyla ${response.count} öğrenci sisteme eklendi.`);
          setTimeout(() => setIsOpen(false), 2000);
        }
        setLoading(false);
      },
      error: (err) => {
        setMessage("CSV okunurken hata oluştu.");
        setLoading(false);
      }
    });
  };

  return (
    <>
      <button className="btn-secondary" onClick={() => setIsOpen(true)}>x Excel (CSV) ile Yükle</button>
      
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Toplu Öğrenci Ekle (CSV)</h3>
              <button type="button" className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Öğrencilerinizi tek tıkla yükleyin. Yükleyeceğiniz CSV dosyasının ilk satırında şu İngilizce başlıklar bulunmalıdır: <strong>name, username, password</strong>.
            </p>

            {message && (
              <div style={{ padding: '0.8rem', marginBottom: '1rem', background: message.includes('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('✅') ? '#10b981' : '#ef4444', borderRadius: '8px' }}>
                {message}
              </div>
            )}

            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              className="input-field"
              disabled={loading}
              style={{ padding: '1rem', border: '1px dashed var(--border)' }}
            />
            {loading && <p style={{ marginTop: '1rem', color: 'var(--primary)' }}>Yükleniyor, lütfen bekleyin...</p>}
          </div>
        </div>
      )}
    </>
  );
}
