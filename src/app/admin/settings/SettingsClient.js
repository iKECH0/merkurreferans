"use client";
import { useState } from "react";
import { updateSettings, updateAdminCredentials } from "./actions";
import { ROLE_LABELS_TR, TEACHER_ROLES } from "@/lib/roleConstants";
import { normalizeScenarioShares, REVENUE_SCENARIOS, SHARE_PARTICIPANTS } from "@/lib/revenueScenarios";

export default function SettingsClient({ currentSettings, institutionRevenueSummary, recentInstitutionRevenues }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [openScenario, setOpenScenario] = useState("A");
  const [scenarioShares, setScenarioShares] = useState(() => normalizeScenarioShares(currentSettings?.scenarioShares, currentSettings));

  const updateScenarioShare = (role, scenario, participant, value) => {
    const numericValue = Math.min(100, Math.max(0, Number(value) || 0));
    setScenarioShares((current) => ({
      ...current,
      [role]: {
        ...current[role],
        [scenario]: { ...current[role][scenario], [participant]: numericValue }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const res = await updateSettings(formData);
    setLoading(false);

    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Ayarlar başarıyla kaydedildi!" });
      setTimeout(() => setMessage(null), 3000);
    }
  };


  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Sistem Ayarları & Duyuru</h3>
      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? '#ef4444' : '#10b981', border: message.type === 'error' ? '1px solid #ef4444' : '1px solid #10b981' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <input type="hidden" name="scenarioShares" value={JSON.stringify(scenarioShares)} />
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Kurum Adı</label>
          <input 
            type="text" 
            name="institutionName" 
            defaultValue={currentSettings?.institutionName || "MERKÜR REFERANS"} 
            className="input-field" 
            required 
            placeholder="Örn: X Akademi"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Logo URL</label>
          <input 
            type="url" 
            name="logoUrl" 
            defaultValue={currentSettings?.logoUrl || ""} 
            className="input-field" 
            placeholder="Örn: https://siteniz.com/logo.png"
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Bu logo URL'si, öğrenci gelişim karnelerinin (PDF) en üstünde çıkacaktır. Sadece geçerli bir resim linki giriniz.
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Abonelik Referans Komisyonu (₺)</label>
          <input 
            type="number" 
            name="commissionRate" 
            defaultValue={currentSettings?.commissionRate || 15.0} 
            className="input-field" 
            step="0.01"
            required 
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Öğrenci abonelik paketini aldığında doğrudan davet edene gidecek standart tutar.
          </p>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#10b981' }}>MERKÜR REFERANS – Gelir Paylaşım Senaryoları</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Bir senaryoyu açarak her öğretmen kademesi için kurum, öğretmen, veli ve öğrenci paylarını ayrı ayrı belirleyin. Her satırın toplamı %100 olmalıdır.
          </p>

          {REVENUE_SCENARIOS.map((scenario) => {
            const isOpen = openScenario === scenario.key;
            return (
              <div key={scenario.key} style={{ marginBottom: '0.8rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOpenScenario(isOpen ? null : scenario.key)}
                  style={{ width: '100%', padding: '1rem', border: 0, cursor: 'pointer', textAlign: 'left', color: '#fff', background: isOpen ? 'rgba(16,185,129,0.12)' : 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
                >
                  <span><strong>{scenario.key} Senaryosu – {scenario.title}</strong><br/><small style={{ color: '#94a3b8' }}>{scenario.description}</small></span>
                  <span>{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="table-responsive" style={{ padding: '0.75rem' }}>
                    <table className="data-table" style={{ minWidth: '720px' }}>
                      <thead>
                        <tr>
                          <th>Öğretmen Grubu</th>
                          {SHARE_PARTICIPANTS.map((participant) => <th key={participant.key}>{participant.label} (%)</th>)}
                          <th>Toplam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TEACHER_ROLES.map((role) => {
                          const row = scenarioShares[role][scenario.key];
                          const total = SHARE_PARTICIPANTS.reduce((sum, participant) => sum + Number(row[participant.key] || 0), 0);
                          return (
                            <tr key={role}>
                              <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{ROLE_LABELS_TR[role]}</td>
                              {SHARE_PARTICIPANTS.map((participant) => (
                                <td key={participant.key}>
                                  <input
                                    aria-label={`${ROLE_LABELS_TR[role]} ${scenario.key} ${participant.label} payı`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={row[participant.key]}
                                    onChange={(event) => updateScenarioShare(role, scenario.key, participant.key, event.target.value)}
                                    className="input-field"
                                    style={{ minWidth: '80px', padding: '0.55rem' }}
                                  />
                                </td>
                              ))}
                              <td style={{ fontWeight: 700, color: Math.abs(total - 100) < 0.01 ? '#10b981' : '#ef4444' }}>%{total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          <input type="hidden" name="lessonTeacherShareA" value={scenarioShares.TEACHER.A.teacher} />
          <input type="hidden" name="lessonTeacherShareB" value={scenarioShares.TEACHER.B.teacher} />
          <input type="hidden" name="leaderTeacherShare" value={currentSettings?.leaderTeacherShare ?? 10} />
          <input type="hidden" name="parentReferralBonus" value={currentSettings?.parentReferralBonus ?? 15} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Genel Duyuru (Tüm Öğrenciler Görür)</label>
          <textarea 
            name="announcement" 
            defaultValue={currentSettings?.announcement || ""} 
            className="input-field" 
            rows="3"
            placeholder="Örn: Bu haftanın birincisi Ahmet oldu! Tebrikler!"
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
          {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Yönetici Giriş Bilgileri</h3>
        <form action={async (formData) => {
          setLoading(true);
          const res = await updateAdminCredentials(formData);
          setLoading(false);
          if (res.error) {
            setMessage({ type: "error", text: res.error });
          } else {
            setMessage({ type: "success", text: "Yönetici bilgileri başarıyla güncellendi! Bir sonraki girişte yeni şifrenizi kullanın." });
            setTimeout(() => setMessage(null), 5000);
          }
        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Kullanıcı Adı</label>
            <input 
              type="text" 
              name="username" 
              className="input-field" 
              required 
              placeholder="Yeni kullanıcı adı"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Yeni Şifre</label>
            <input 
              type="password" 
              name="password" 
              className="input-field" 
              placeholder="Değiştirmek istemiyorsanız boş bırakın"
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Şifrenizi değiştirmek için en az 6 karakterli yeni bir şifre girin. Değiştirmek istemiyorsanız burayı boş bırakabilirsiniz.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
            {loading ? "Kaydediliyor..." : "Giriş Bilgilerini Güncelle"}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        <div>
          <h3 style={{ color: '#fbbf24', marginBottom: '0.5rem' }}>Kurum Gelir Kaydı</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.4rem' }}>₺{Number(institutionRevenueSummary?.total || 0).toFixed(2)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{institutionRevenueSummary?.count || 0} kayıtlı gelir hareketi</p>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {recentInstitutionRevenues?.map((revenue) => (
              <div key={revenue.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>Senaryo {revenue.scenario} · {revenue.type === 'LESSON' ? 'Ders' : 'Paket'}</span>
                <strong style={{ color: '#10b981' }}>₺{Number(revenue.amount).toFixed(2)}</strong>
              </div>
            ))}
            {(!recentInstitutionRevenues || recentInstitutionRevenues.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Henüz kurum gelir hareketi yok.</span>}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Veri Yedekleme (JSON)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Sistemdeki tüm öğrenci kayıtlarını, şifreleri ve skorları bilgisayarınıza indirip güvenle saklayabilirsiniz.
          </p>
          <a href="/api/backup" download className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', background: '#10b981', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
            ⬇️ Tüm Verileri İndir (.json)
          </a>
        </div>
      </div>
    </div>
  );
}
