import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export const metadata = {
  title: "Öğrenci Gelişim Raporu | MERKÜR REFERANS",
};

export default async function StudentReportPage({ params }) {
  const resolvedParams = await params;
  const studentId = resolvedParams.id;

  const student = await prisma.user.findUnique({
    where: { id: studentId, role: "STUDENT" },
    include: {
      progress: {
        include: { exercise: true },
        orderBy: { completedAt: "asc" }
      }
    }
  });

  if (!student) {
    notFound();
  }

  const settings = await prisma.settings.findUnique({
    where: { id: "GLOBAL" }
  });
  const institutionName = settings?.institutionName || "MERKÜR REFERANS Sistemleri";
  const logoUrl = settings?.logoUrl;

  const totalXp = student.progress.reduce((sum, p) => sum + (p.score || 0), 0);
  const totalExercises = student.progress.length;
  
  const wpmRecords = student.progress.filter(p => p.wpm !== null);
  const highestWpm = wpmRecords.length > 0 ? Math.max(...wpmRecords.map(p => p.wpm)) : 0;
  
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* NO-PRINT HEADER */}
      <div className="no-print" style={{ padding: '1.5rem', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/admin/students" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Yönetim Paneline Dön
        </Link>
        <PrintButton />
      </div>

      {/* A4 REPORT CONTAINER */}
      <div className="report-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          {logoUrl && (
            <img src={logoUrl} alt="Kurum Logosu" style={{ maxHeight: '60px', marginBottom: '0.5rem', objectFit: 'contain' }} />
          )}
          <h1 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '0.2rem' }}>{institutionName}</h1>
          <h2 style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: '400' }}>Öğrenci Gelişim Raporu</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <div>
            <p style={{ margin: '0 0 0.2rem 0', color: '#64748b' }}>Öğrenci Adı Soyadı:</p>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{student.name || student.username}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 0.2rem 0', color: '#64748b' }}>Rapor Tarihi:</p>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{new Date().toLocaleDateString('tr-TR')}</h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.8rem' }}>Toplam Puan (XP)</h4>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6' }}>{totalXp}</div>
          </div>
          <div style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.8rem' }}>Tamamlanan Egzersiz</h4>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>{totalExercises}</div>
          </div>
          <div style={{ background: '#f1f5f9', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.8rem' }}>En Yüksek Hız</h4>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#8b5cf6' }}>{highestWpm} WPM</div>
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem', marginBottom: '1rem', color: '#0f172a', fontSize: '1.1rem' }}>Eğitim Geçmişi (Tüm Egzersizler)</h3>
        
        {student.progress.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>Öğrenci henüz hiçbir egzersiz yapmamış.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid #cbd5e1' }}>Tarih</th>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid #cbd5e1' }}>Egzersiz / Oyun</th>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid #cbd5e1' }}>Puan</th>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid #cbd5e1' }}>Hız (WPM / Skor)</th>
              </tr>
            </thead>
            <tbody>
              {student.progress.map((p, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.5rem' }}>{new Date(p.completedAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '0.5rem', fontWeight: '500' }}>{p.exercise.title}</td>
                  <td style={{ padding: '0.5rem', color: '#3b82f6', fontWeight: 'bold' }}>+{p.score} XP</td>
                  <td style={{ padding: '0.5rem' }}>{p.wpm ? `${p.wpm}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div style={{ marginTop: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
          Bu rapor {institutionName} tarafından otomatik oluşturulmuştur.<br/>
          © {new Date().getFullYear()} Tüm Hakları Saklıdır.
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print, .admin-sidebar, .topbar { display: none !important; }
          .admin-content { margin-left: 0 !important; width: 100% !important; padding: 0 !important; }
          .report-container { box-shadow: none !important; padding: 2cm 1cm !important; max-width: 100% !important; }
        }
      `}} />
    </div>
  );
}
