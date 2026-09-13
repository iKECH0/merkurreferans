import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Video, Calendar, ArrowRight, CheckCircle, BookOpen, Clock, FileSpreadsheet, ExternalLink } from 'lucide-react';

export const metadata = {
  title: "Öğrenci Paneli | MERKÜR YÖRÜNGE",
};

export default async function StudentDashboard() {
  const session = await auth();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const excelUrl = "https://docs.google.com/spreadsheets/d/1IvC7Kme6lZugdHtaQJTsNZ-sYhhYBPEBW5HkEkVmqT0/edit?gid=2037362416#gid=2037362416";

  return (
    <div style={{ padding: '0.5rem 0 2rem' }}>
      
      {/* 1. Premium Karşılama Alanı */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -20px rgba(139,92,246,0.1)'
      }}>
        {/* Glow effect */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Hoş Geldin, <span style={{ background: 'linear-gradient(to right, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || user?.username}</span> 👋
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '550px', lineHeight: '1.6', margin: 0, position: 'relative', zIndex: 1 }}>
          Eğitim yolculuğunda yeni bir gün! Yaklaşan canlı derslerine katılabilir, detaylı danışmanlık tablonu inceleyebilirsin.
        </p>
      </div>

      {/* 2. Durum Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {user?.isActive ? (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 0.3rem 0', fontSize: '1.15rem', fontWeight: '700' }}>Abonelik Aktif</h4>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Tüm canlı derslere erişiminiz açık.</p>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Clock size={28} />
            </div>
            <div>
              <h4 style={{ color: '#fff', margin: '0 0 0.3rem 0', fontSize: '1.15rem', fontWeight: '700' }}>Onay Bekleniyor</h4>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Lütfen ödemenizi tamamlayın.</p>
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.15)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.05))', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h4 style={{ color: '#fff', margin: '0 0 0.3rem 0', fontSize: '1.15rem', fontWeight: '700' }}>Aktif Dersler</h4>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Canlı ders takviminizi inceleyin.</p>
          </div>
        </div>

      </div>

      {/* 3. Hızlı Erişim Kartları */}
      <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={24} color="#a78bfa" /> Hızlı Erişim
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Canlı Dersler Card */}
        <div style={{ 
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '24px', 
          padding: '2rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <Video size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: '700' }}>Canlı Derslerim</h3>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.5' }}>Yaklaşan ders takviminizi görüntüleyin ve HD Zoom yayınlarına tek tıkla bağlanın.</p>
          <Link href="/student/lessons" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem', 
            width: '100%', 
            padding: '1rem', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '12px',
            fontWeight: '600',
            boxShadow: '0 8px 20px -8px rgba(59, 130, 246, 0.6)'
          }}>
            Ders Takvimini Gör <ArrowRight size={18} />
          </Link>
        </div>

        {/* Google Sheets Danışmanlık Tablosu Card */}
        <div style={{ 
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)', 
          border: '1px solid rgba(16, 185, 129, 0.25)', 
          borderRadius: '24px', 
          padding: '2rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.15)'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <FileSpreadsheet size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem', fontWeight: '700' }}>Eğitim Danışmanlığı Tablosu</h3>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.5' }}>Detaylı eğitim programınızı ve çalışma takviminizi Google Excel tablosu üzerinden takip edin.</p>
          <a href={excelUrl} target="_blank" rel="noopener noreferrer" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem', 
            width: '100%', 
            padding: '1rem', 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            color: '#fff', 
            textDecoration: 'none', 
            borderRadius: '12px',
            fontWeight: '600',
            boxShadow: '0 8px 20px -8px rgba(16, 185, 129, 0.6)'
          }}>
            Excel Tablosunu Aç <ExternalLink size={18} />
          </a>
        </div>

      </div>

    </div>
  );
}
