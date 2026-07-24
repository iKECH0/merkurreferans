import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Tüm Canlı Dersler | Admin",
};

export default async function AdminLessonsPage() {
  const lessons = await prisma.lesson.findMany({
    include: { 
      student: true,
      teacher: true 
    },
    orderBy: { startTime: 'desc' }
  });

  return (
    <div className="dashboard-wrapper">
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "var(--text-main)" }}>🎓 Tüm Canlı Dersler (Zoom)</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
          Sistemde planlanan tüm canlı dersleri, Zoom linklerini ve durumlarını buradan takip edebilirsiniz.
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
          Sistemde planlanmış herhangi bir ders bulunmuyor.
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
                {lessons.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: "500", color: "var(--primary)" }}>{l.title}</td>
                    <td>{l.teacher?.name || "Bilinmiyor"}</td>
                    <td>{l.student?.name || "Bilinmiyor"}</td>
                    <td>
                      {new Date(l.startTime).toLocaleDateString('tr-TR')} - {new Date(l.startTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        background: l.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: l.isCompleted ? '#10b981' : '#fbbf24',
                        border: l.isCompleted ? '1px solid #10b981' : '1px solid #fbbf24'
                      }}>
                        {l.isCompleted ? 'Tamamlandı' : 'Bekliyor'}
                      </span>
                    </td>
                    <td>
                      {l.zoomLink ? (
                        <a href={l.zoomLink} target="_blank" rel="noreferrer" style={{ color: "var(--secondary)", textDecoration: "underline", fontSize: "0.9rem" }}>
                          Linke Git
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
