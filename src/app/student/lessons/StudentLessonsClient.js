"use client";

import { useState } from "react";
import { Video, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function StudentLessonsClient({ lessons }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SCHEDULED":
        return <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> Planlandı</span>;
      case "COMPLETED":
        return <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} /> Tamamlandı</span>;
      case "CANCELLED":
        return <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><XCircle size={14} /> İptal Edildi</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const isLessonActive = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    // 15 minutes before start is allowed
    const allowedStart = new Date(start.getTime() - 15 * 60000);
    return now >= allowedStart && now <= end;
  };

  if (!lessons || lessons.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
        <div style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          <Calendar size={48} style={{ opacity: 0.5 }} />
        </div>
        <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>Henüz Planlanmış Bir Dersiniz Yok</h3>
        <p style={{ color: "var(--text-muted)" }}>
          Öğretmeniniz sizin için bir ders planladığında burada görünecektir.
        </p>
      </div>
    );
  }

  return (
    <div className="lessons-grid" style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {lessons.map((lesson) => {
        const active = lesson.status === "SCHEDULED" && isLessonActive(lesson.startTime, lesson.endTime);

        return (
          <div key={lesson.id} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 style={{ color: "var(--text-main)", fontSize: "1.1rem", margin: 0 }}>{lesson.title}</h3>
              {getStatusBadge(lesson.status)}
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                <strong style={{ color: "var(--primary)" }}>Öğretmen:</strong> {lesson.teacher?.name || lesson.teacher?.username}
              </p>
              <p style={{ margin: "0", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                <Calendar size={16} /> {formatDate(lesson.startTime)}
              </p>
              <p style={{ margin: "0.3rem 0 0 0", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", fontWeight: "bold" }}>
                <Clock size={16} /> {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
              </p>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
              {lesson.status === "SCHEDULED" ? (
                active ? (
                  <a
                    href={lesson.zoomLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", width: "100%", textDecoration: "none", padding: "0.8rem" }}
                  >
                    <Video size={18} />
                    Derse Katıl
                  </a>
                ) : (
                  <button
                    disabled
                    className="btn-secondary"
                    style={{ width: "100%", padding: "0.8rem", opacity: 0.7, cursor: "not-allowed" }}
                  >
                    Ders Saati Bekleniyor
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="btn-secondary"
                  style={{ width: "100%", padding: "0.8rem", opacity: 0.5, cursor: "not-allowed" }}
                >
                  {lesson.status === "COMPLETED" ? "Ders Sona Erdi" : "İptal Edildi"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
