"use client";

import { Video, Clock, Calendar, CheckCircle, PlayCircle, User } from "lucide-react";

export default function StudentLessonsClient({ lessons }) {
  // --- MOCK DATA FOR SCREENSHOT PURPOSES ---
  // The user requested mock data specific to this account so they can take beautiful screenshots
  const mockLessons = [
    {
      id: "mock-1",
      title: "YKS Matematik: Türev ve İntegral Uygulamaları",
      teacher: { name: "Ahmet Yılmaz", avatar: "AY", color: "linear-gradient(135deg, #3b82f6, #06b6d4)" },
      startTime: new Date(new Date().getTime() - 10 * 60000).toISOString(), // 10 mins ago (ACTIVE)
      endTime: new Date(new Date().getTime() + 50 * 60000).toISOString(),
      status: "SCHEDULED",
      zoomLink: "https://zoom.us/j/123456",
      category: "Matematik",
      isLive: true
    },
    {
      id: "mock-2",
      title: "TYT Fizik: Newton'un Hareket Yasaları",
      teacher: { name: "Ayşe Kaya", avatar: "AK", color: "linear-gradient(135deg, #8b5cf6, #d946ef)" },
      startTime: new Date(new Date().getTime() + 120 * 60000).toISOString(), // In 2 hours
      endTime: new Date(new Date().getTime() + 180 * 60000).toISOString(),
      status: "SCHEDULED",
      zoomLink: "https://zoom.us/j/123456",
      category: "Fizik",
      isLive: false
    },
    {
      id: "mock-3",
      title: "AYT Kimya: Organik Bileşikler",
      teacher: { name: "Mehmet Demir", avatar: "MD", color: "linear-gradient(135deg, #10b981, #14b8a6)" },
      startTime: new Date(new Date().getTime() - 86400000).toISOString(), // Yesterday
      endTime: new Date(new Date().getTime() - 82800000).toISOString(),
      status: "COMPLETED",
      zoomLink: "",
      category: "Kimya",
      isLive: false
    }
  ];

  // We override the real lessons with our beautiful mock data specifically for the Play Store screenshot
  const displayLessons = mockLessons;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", marginTop: '1rem' }}>
      {displayLessons.map((lesson) => {
        return (
          <div key={lesson.id} style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: lesson.isLive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: lesson.isLive ? '0 10px 30px -10px rgba(16, 185, 129, 0.2)' : '0 10px 30px -10px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            
            {/* Live Indicator Background Glow */}
            {lesson.isLive && (
               <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '150px', height: '100px', background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }}></div>
            )}

            {/* Header: Title & Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: '1rem', position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: "#fff", fontSize: "1.15rem", margin: 0, fontWeight: '700', lineHeight: '1.4' }}>
                {lesson.title}
              </h3>
              {lesson.isLive ? (
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid rgba(16, 185, 129, 0.3)', whiteSpace: 'nowrap' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span> CANLI
                </span>
              ) : lesson.status === "COMPLETED" ? (
                <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid rgba(255, 255, 255, 0.1)', whiteSpace: 'nowrap' }}>
                  <CheckCircle size={12} /> Bitti
                </span>
              ) : (
                <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap' }}>
                  <Clock size={12} /> Planlandı
                </span>
              )}
            </div>

            {/* Teacher & Details */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: '1px solid rgba(255,255,255,0.05)', padding: "1rem", borderRadius: "16px", position: 'relative', zIndex: 1 }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: lesson.teacher.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  {lesson.teacher.avatar}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eğitmen</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '600' }}>{lesson.teacher.name}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                   <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarih</p>
                   <p style={{ margin: "0", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: '500' }}>
                    <Calendar size={14} color="#64748b" /> {formatDate(lesson.startTime)}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                   <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saat</p>
                   <p style={{ margin: "0", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", fontWeight: '500' }}>
                    <Clock size={14} color="#64748b" /> {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                  </p>
                </div>
              </div>

            </div>

            {/* Action Button */}
            <div style={{ marginTop: "auto", position: 'relative', zIndex: 1 }}>
              {lesson.isLive ? (
                  <a
                    href={lesson.zoomLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", width: "100%", textDecoration: "none", padding: "0.9rem", background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', borderRadius: '14px', fontWeight: '700', fontSize: '1rem', boxShadow: '0 8px 20px -8px rgba(16, 185, 129, 0.6)', border: '1px solid rgba(16, 185, 129, 0.8)' }}
                  >
                    <PlayCircle size={20} />
                    Derse Katıl (Canlı)
                  </a>
              ) : lesson.status === "SCHEDULED" ? (
                  lesson.zoomLink ? (
                    <a
                      href={lesson.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", width: "100%", textDecoration: "none", padding: "0.9rem", background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', borderRadius: '14px', fontWeight: '700', fontSize: '1rem', boxShadow: '0 8px 20px -8px rgba(59, 130, 246, 0.6)' }}
                    >
                      <Video size={20} />
                      Derse Katıl (Zoom Linki)
                    </a>
                  ) : (
                    <button
                      disabled
                      style={{ width: "100%", padding: "0.9rem", opacity: 0.6, cursor: "not-allowed", background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '14px', fontWeight: '600', display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                    >
                      <Clock size={18} /> Ders Saati Bekleniyor
                    </button>
                  )
              ) : (
                  <button
                    disabled
                    style={{ width: "100%", padding: "0.9rem", opacity: 0.4, cursor: "not-allowed", background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#64748b', borderRadius: '14px', fontWeight: '600', display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
                  >
                    <CheckCircle size={18} /> Ders Sona Erdi
                  </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
