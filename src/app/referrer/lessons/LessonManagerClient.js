"use client";
import { useState } from "react";
import { createLesson, completeLesson } from "./actions";
import { Video, Play, CheckCircle, Zap, Calendar, Radio, Copy } from "lucide-react";
import toast from 'react-hot-toast';
import { customConfirm } from "@/lib/toastHelpers";

export default function LessonManagerClient({ lessons, students }) {
  const [loading, setLoading] = useState(false);
  const [planMode, setPlanMode] = useState("quick"); // quick | detailed
  const [quickDay, setQuickDay] = useState("today"); // today | tomorrow
  const [quickStartTime, setQuickStartTime] = useState("19:00");
  const [quickEndTime, setQuickEndTime] = useState("20:00");

  const isLessonActive = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    const fifteenMinsBefore = new Date(start.getTime() - 15 * 60000);
    return now >= fifteenMinsBefore && now <= end;
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Zoom linki panoya kopyalandı!");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    // If quick mode, calculate exact datetimes
    if (planMode === "quick") {
      const now = new Date();
      const year = now.getFullYear();
      const [startH, startM] = quickStartTime.split(':');
      const [endH, endM] = quickEndTime.split(':');

      const startD = new Date(year, now.getMonth(), quickDay === "tomorrow" ? now.getDate() + 1 : now.getDate(), parseInt(startH), parseInt(startM));
      const endD = new Date(year, now.getMonth(), quickDay === "tomorrow" ? now.getDate() + 1 : now.getDate(), parseInt(endH), parseInt(endM));
      
      if (startD < new Date(now.getTime() - 5 * 60000)) {
        toast.error("Geçmiş bir zaman için ders planlayamazsınız.");
        setLoading(false);
        return;
      }

      if (endD <= startD) {
        toast.error("Bitiş saati başlangıç saatinden sonra olmalıdır.");
        setLoading(false);
        return;
      }
      
      formData.set("startTime", startD.toISOString());
      formData.set("endTime", endD.toISOString());
    } else {
      // detailed mode timezone fix
      const startVal = formData.get("startTime");
      const endVal = formData.get("endTime");
      const startD = new Date(startVal);
      const endD = new Date(endVal);
      
      if (startD < new Date(Date.now() - 5 * 60000)) {
        toast.error("Geçmiş bir zaman için ders planlayamazsınız.");
        setLoading(false);
        return;
      }

      if (endD <= startD) {
        toast.error("Bitiş saati başlangıç saatinden sonra olmalıdır.");
        setLoading(false);
        return;
      }

      formData.set("startTime", startD.toISOString());
      formData.set("endTime", endD.toISOString());
    }

    const res = await createLesson(formData);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Ders başarıyla planlandı. Zoom linki hazır!");
      e.target.reset();
    }
  };

  const handleComplete = async (lessonId) => {
    const confirmed = await customConfirm("Bu dersi tamamlandı olarak işaretlemek istediğinize emin misiniz? Bu işlem komisyonları anında cüzdanlara aktaracaktır.");
    if (!confirmed) {
      return;
    }
    
    setLoading(true);
    const res = await completeLesson(lessonId);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Ders başarıyla tamamlandı ve hakedişler cüzdanlara yansıdı!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Ders Planlama Formu */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#10b981' }}>Yeni Ders Planla (Zoom)</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Ders Konusu / Başlığı</label>
            <input type="text" name="title" className="input-field" required placeholder="Örn: Hızlı Okuma Temel Teknikleri" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Öğrenci Seçin</label>
            <select name="studentId" className="input-field" required style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              <option value="">-- Öğrenci Seç --</option>
              {students.map(s => (
                <option key={s.id} value={s.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{s.name || s.username} ({s.referrerId === s.myId ? 'Benim Öğrencim' : 'Kurum Öğrencisi'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Ders Ücreti (₺)</label>
            <input type="number" name="price" className="input-field" required step="0.01" placeholder="0.00" />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Komisyonlar bu ücret üzerinden hesaplanacaktır.</p>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button type="button" onClick={() => setPlanMode("quick")} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: planMode === "quick" ? "#10b981" : "transparent", color: planMode === "quick" ? "#fff" : "#10b981", border: "1px solid #10b981" }}>
              <Zap size={18} /> Hızlı Planla
            </button>
            <button type="button" onClick={() => setPlanMode("detailed")} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: planMode === "detailed" ? "#10b981" : "transparent", color: planMode === "detailed" ? "#fff" : "#10b981", border: "1px solid #10b981" }}>
              <Calendar size={18} /> Detaylı Planla
            </button>
          </div>

          {planMode === "quick" ? (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Ders Ne Zaman?</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setQuickDay("today")} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: quickDay === "today" ? '2px solid #3b82f6' : '1px solid var(--border-color)', background: quickDay === "today" ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}>Bugün</button>
                  <button type="button" onClick={() => setQuickDay("tomorrow")} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: quickDay === "tomorrow" ? '2px solid #3b82f6' : '1px solid var(--border-color)', background: quickDay === "tomorrow" ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}>Yarın</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Başlangıç Saati</label>
                  <input type="time" className="input-field" value={quickStartTime} onChange={(e) => setQuickStartTime(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Bitiş Saati</label>
                  <input type="time" className="input-field" value={quickEndTime} onChange={(e) => setQuickEndTime(e.target.value)} required />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Başlangıç Tarihi & Saati</label>
                <input type="datetime-local" name="startTime" className="input-field" required={planMode === "detailed"} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Bitiş Tarihi & Saati</label>
                <input type="datetime-local" name="endTime" className="input-field" required={planMode === "detailed"} />
              </div>
            </>
          )}

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem 2rem', width: '100%' }}>
              {loading ? "Planlanıyor..." : "Dersi Planla ve Zoom Linki Oluştur"}
            </button>
          </div>
        </form>
      </div>

      {/* Planlı Dersler Tablosu */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Yaklaşan & Tamamlanan Derslerim</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ders / Konu</th>
                <th>Öğrenci</th>
                <th>Tarih</th>
                <th>Ücret</th>
                <th>Zoom Linki</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map(lesson => {
                const isActive = lesson.status === 'SCHEDULED' && isLessonActive(lesson.startTime, lesson.endTime);
                const zoomTargetLink = lesson.zoomStartLink || lesson.zoomLink;
                
                return (
                  <tr key={lesson.id}>
                    <td>{lesson.title}</td>
                    <td>{lesson.student?.name || lesson.student?.username}</td>
                    <td>
                      {new Date(lesson.startTime).toLocaleString('tr-TR')}
                    </td>
                    <td>{lesson.price} ₺</td>
                    <td>
                      {zoomTargetLink ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <a 
                            href={zoomTargetLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              color: isActive ? '#10b981' : '#3b82f6', 
                              textDecoration: 'none', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.3rem', 
                              fontWeight: 'bold',
                              background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '8px',
                              border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                              fontSize: '0.85rem'
                            }}
                          >
                            {isActive ? <Radio size={14} style={{ animation: 'pulse-icon 1.5s ease-in-out infinite' }} /> : <Video size={14} />}
                            {isActive ? 'Derse Başlat (Canlı)' : 'Derse Başlat'}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(lesson.zoomLink || lesson.zoomStartLink)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              padding: '0.3rem 0.6rem',
                              color: 'var(--text-main)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                            title="Öğrenci Zoom Linkini Kopyala"
                          >
                            <Copy size={13} /> Linki Kopyala
                          </button>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {isActive ? (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 1.5s ease-in-out infinite', display: 'inline-block' }} />
                          Ders Aktif
                        </span>
                      ) : (
                        <span className="badge" style={{ background: lesson.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: lesson.status === 'COMPLETED' ? '#10b981' : '#f59e0b', border: `1px solid ${lesson.status === 'COMPLETED' ? '#10b981' : '#f59e0b'}` }}>
                          {lesson.status === 'COMPLETED' ? 'Tamamlandı' : 'Planlandı'}
                        </span>
                      )}
                    </td>
                    <td>
                      {lesson.status !== 'COMPLETED' && (
                        <button onClick={() => handleComplete(lesson.id)} className="btn-primary" disabled={loading} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle size={16} /> Tamamla
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {lessons.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Henüz planlanmış bir ders bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
