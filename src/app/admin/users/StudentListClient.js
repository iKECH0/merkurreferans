"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import ResetPasswordClient from "./ResetPasswordClient";
import { deleteStudent, approveStudent } from "./actions";
import toast from 'react-hot-toast';
import { customConfirm } from "@/lib/toastHelpers";
import { getUserLevel } from "@/lib/userLevels";

export default function StudentListClient({ initialStudents }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredStudents = initialStudents.filter(s => 
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.username && s.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id, name) => {
    const confirmed = await customConfirm(`${name} adlı kişiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileri silinir.`);
    if (confirmed) {
      startTransition(async () => {
        const res = await deleteStudent(id);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Öğrenci silindi.");
        }
      });
    }
  };

  const handleApprove = async (id, name, requestedMonths) => {
    const confirmed = await customConfirm(`${name} adlı öğrencinin ödemesini aldığınızı onaylıyor musunuz? (Varsa referanssine komisyon yansıtılacaktır.)`);
    if (confirmed) {
      startTransition(async () => {
        const res = await approveStudent(id, requestedMonths || 1);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Öğrenci başarıyla onaylandı!");
        }
      });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Öğrenci Adı veya Kullanıcı Adı ara..." 
          className="input-field"
          style={{ maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span style={{ color: 'var(--text-muted)' }}>Toplam {filteredStudents.length} öğrenci</span>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          Aradığınız kritere uygun öğrenci bulunamadı.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>Kullanıcı Adı</th>
                <th>Abonelik Bitiş / Talep</th>

                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isExpired = student.subscriptionEnd && new Date(student.subscriptionEnd) < new Date();
                const levelInfo = getUserLevel(student.role, student._count?.referrals || 0);
                
                return (
                  <tr key={student.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{student.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: `${levelInfo.color}15`, borderRadius: '8px', border: `1px solid ${levelInfo.color}40`, color: levelInfo.color, whiteSpace: 'nowrap' }}>
                            {levelInfo.icon} {levelInfo.title}
                          </span>
                          {student.referrer && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '0.15rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
                              Rehber: {student.referrer.name || student.referrer.username}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{student.username}</td>
                    <td>
                      {student.isActive 
                        ? (student.subscriptionEnd ? new Date(student.subscriptionEnd).toLocaleDateString('tr-TR') : 'Sınırsız')
                        : <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{student.requestedMonths} Ay Talep Edildi</span>
                      }
                    </td>

                    <td>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        background: !student.isActive ? 'rgba(245, 158, 11, 0.1)' : isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: !student.isActive ? '#fbbf24' : isExpired ? '#ef4444' : '#10b981',
                        border: !student.isActive ? '1px solid #fbbf24' : isExpired ? '1px solid #ef4444' : '1px solid #10b981'
                      }}>
                        {!student.isActive ? 'Bekliyor' : isExpired ? 'Süresi Doldu' : 'Aktif'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>

                      {!student.isActive && (
                        <button
                          className="btn-sm btn-success"
                          onClick={() => handleApprove(student.id, student.name, student.requestedMonths)}
                          disabled={isPending}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
                        >
                          ✅ Onayla
                        </button>
                      )}

                      <ResetPasswordClient student={student} />
                      <button 
                        className="btn-sm btn-danger" 
                        onClick={() => handleDelete(student.id, student.name || student.username)}
                        disabled={isPending}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
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
      )}
    </div>
  );
}
