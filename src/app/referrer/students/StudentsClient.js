"use client";
import { useState, useTransition } from "react";
import { addStudentByReferrer, deleteStudentByReferrer } from "./actions";
import toast from 'react-hot-toast';
import { customConfirm } from "@/lib/toastHelpers";

export default function StudentsClient({ students, currentUserId }) {
  const [activeTab, setActiveTab] = useState("LIST"); // LIST, EKLE
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [requestedMonths, setRequestedMonths] = useState("1");

  const handleDeleteStudent = async (id, studentName) => {
    const confirmed = await customConfirm(`${studentName || 'Bu öğrenciyi'} silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
    if (confirmed) {
      startTransition(async () => {
        const res = await deleteStudentByReferrer(id);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Öğrenci silindi.");
        }
      });
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("phone", phone);
    formData.append("requestedMonths", requestedMonths);

    startTransition(async () => {
      const res = await addStudentByReferrer(formData, currentUserId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Öğrenci başarıyla eklendi. Yönetici onayından sonra aktifleşecek.");
        setName(""); setUsername(""); setPassword(""); setPhone(""); setRequestedMonths("1");
        setActiveTab("LIST");
      }
    });
  };

  return (
    <div className="dashboard-wrapper">
      <h2>Ağımdaki Öğrenciler</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Sizin vasıtanızla kayıt olan öğrencilerin listesi ve durumları.
      </p>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <button 
            className={`btn-sm ${activeTab === 'LIST' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'LIST' ? 'transparent' : '', border: activeTab !== 'LIST' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
            onClick={() => setActiveTab('LIST')}
          >
            Öğrenci Listesi
          </button>
          <button 
            className={`btn-sm ${activeTab === 'EKLE' ? 'btn-primary' : ''}`}
            style={{ background: activeTab !== 'EKLE' ? 'transparent' : '', border: activeTab !== 'EKLE' ? '1px solid rgba(255,255,255,0.2)' : 'none', marginLeft: 'auto' }}
            onClick={() => setActiveTab('EKLE')}
          >
            + Yeni Öğrenci Ekle
          </button>
        </div>

        {activeTab === 'LIST' && (
          students.length === 0 ? (
            <div className="empty-state">
              Henüz size bağlı bir öğrenci bulunmuyor.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Öğrenci Adı Soyadı</th>
                    <th>Kullanıcı Adı</th>
                    <th>Telefon</th>
                    <th>Kayıt Tarihi</th>
                    <th>Abonelik Bitiş</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const isExpired = student.subscriptionEnd && new Date(student.subscriptionEnd) < new Date();
                    
                    return (
                      <tr key={student.id}>
                        <td style={{ fontWeight: 'bold' }}>{student.name || '-'}</td>
                        <td>{student.username}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{student.phone || '-'}</td>
                        <td>{new Date(student.createdAt).toLocaleDateString('tr-TR')}</td>
                        <td>{student.subscriptionEnd ? new Date(student.subscriptionEnd).toLocaleDateString('tr-TR') : '-'}</td>
                        <td>
                          <span style={{ 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem',
                            background: !student.isActive ? 'rgba(245, 158, 11, 0.1)' : isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: !student.isActive ? '#fbbf24' : isExpired ? '#ef4444' : '#10b981',
                            border: !student.isActive ? '1px solid #fbbf24' : isExpired ? '1px solid #ef4444' : '1px solid #10b981'
                          }}>
                            {!student.isActive ? 'Ödeme / Onay Bekliyor' : isExpired ? 'Süresi Doldu' : 'Aktif (Onaylandı)'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteStudent(student.id, student.name || student.username)}
                            disabled={isPending}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', opacity: isPending ? 0.5 : 1, fontSize: '0.8rem' }}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'EKLE' && (
          <div style={{ maxWidth: '500px' }}>
            <h3>Yeni Öğrenci Ekle</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Buradan doğrudan size bağlı yeni bir öğrenci oluşturabilirsiniz. Öğrenci, yönetici tarafından onaylandığında size komisyon yansıtılır.
            </p>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Öğrenci Adı Soyadı</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Ahmet Yılmaz" required />
              </div>
              <div className="form-group">
                <label>Kullanıcı Adı</label>
                <input type="text" className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="Örn: ahmetyilmaz" required />
              </div>
              <div className="form-group">
                <label>Telefon Numarası (Opsiyonel)</label>
                <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Örn: 0555 123 4567" />
              </div>
              <div className="form-group">
                <label>Şifre</label>
                <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre belirleyin" required />
              </div>
              <div className="form-group">
                <label>Eğitim Paketi (Ay)</label>
                <select className="input-field" value={requestedMonths} onChange={e => setRequestedMonths(e.target.value)} style={{ color: 'black' }}>
                  <option value="1">1 Ay</option>
                  <option value="3">3 Ay</option>
                  <option value="6">6 Ay</option>
                  <option value="12">12 Ay</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={isPending} style={{ marginTop: '1rem' }}>
                {isPending ? 'Ekleniyor...' : 'Öğrenciyi Kaydet'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
