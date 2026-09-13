"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Video, ExternalLink, Check } from "lucide-react";

export default function AdminLessonsClient({ lessons }) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Zoom linki panoya kopyalandı!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLessons = lessons.filter((l) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = l.title?.toLowerCase().includes(term);
    const teacherMatch = l.teacher?.name?.toLowerCase().includes(term) || l.teacher?.username?.toLowerCase().includes(term);
    const studentMatch = l.student?.name?.toLowerCase().includes(term) || l.student?.username?.toLowerCase().includes(term);
    return titleMatch || teacherMatch || studentMatch;
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Ders, öğretmen veya öğrenci ara..."
          className="input-field"
          style={{ maxWidth: "350px", backgroundColor: "#0f172a", color: "#fff" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Toplam {filteredLessons.length} ders listeleniyor
        </span>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Aramanıza uygun planlanmış bir ders bulunamadı.
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ders Başlığı</th>
                  <th>Öğretmen</th>
                  <th>Öğrenci</th>
                  <th>Tarih & Saat</th>
                  <th>Durum</th>
                  <th>Zoom Katılım Linki</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((l) => {
                  const zoomUrl = l.zoomLink || l.zoomStartLink;
                  const isCompleted = l.status === "COMPLETED";

                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight: "600", color: "#38bdf8" }}>{l.title}</td>
                      <td>
                        <div>
                          <span style={{ fontWeight: "500" }}>{l.teacher?.name || l.teacher?.username || "Bilinmiyor"}</span>
                          {l.teacherLevel && (
                            <div style={{ marginTop: "0.2rem" }}>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  padding: "0.1rem 0.4rem",
                                  borderRadius: "6px",
                                  background: `${l.teacherLevel.color}15`,
                                  border: `1px solid ${l.teacherLevel.color}40`,
                                  color: l.teacherLevel.color,
                                  whiteSpace: "nowrap",
                                  display: "inline-block"
                                }}
                              >
                                {l.teacherLevel.icon} {l.teacherLevel.title}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: "500" }}>{l.student?.name || l.student?.username || "Bilinmiyor"}</span>
                          {l.studentLevel && (
                            <div style={{ marginTop: "0.2rem" }}>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  padding: "0.1rem 0.4rem",
                                  borderRadius: "6px",
                                  background: `${l.studentLevel.color}15`,
                                  border: `1px solid ${l.studentLevel.color}40`,
                                  color: l.studentLevel.color,
                                  whiteSpace: "nowrap",
                                  display: "inline-block"
                                }}
                              >
                                {l.studentLevel.icon} {l.studentLevel.title}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(l.startTime).toLocaleDateString("tr-TR")} -{" "}
                        {new Date(l.startTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.65rem",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            background: isCompleted ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                            color: isCompleted ? "#10b981" : "#fbbf24",
                            border: isCompleted ? "1px solid #10b981" : "1px solid #fbbf24"
                          }}
                        >
                          {isCompleted ? "Tamamlandı" : "Bekliyor"}
                        </span>
                      </td>
                      <td>
                        {zoomUrl ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <a
                              href={zoomUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#38bdf8",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                fontWeight: "600",
                                background: "rgba(56, 189, 248, 0.1)",
                                padding: "0.35rem 0.7rem",
                                borderRadius: "8px",
                                border: "1px solid rgba(56, 189, 248, 0.3)",
                                fontSize: "0.85rem",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <Video size={14} /> Linke Git
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(zoomUrl, l.id)}
                              style={{
                                background: copiedId === l.id ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                border: copiedId === l.id ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                padding: "0.35rem 0.7rem",
                                color: copiedId === l.id ? "#10b981" : "var(--text-main)",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                transition: "all 0.2s ease"
                              }}
                              title="Zoom Linkini Kopyala"
                            >
                              {copiedId === l.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                              {copiedId === l.id ? "Kopyalandı!" : "Linki Kopyala"}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
