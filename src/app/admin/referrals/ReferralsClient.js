"use client";
import React, { useState, useTransition } from "react";
import { addReferrer, deleteReferrer, withdrawWalletBalance, updateReferrerIban } from "./actions";
import toast from 'react-hot-toast';
import { customConfirm, customPrompt } from "@/lib/toastHelpers";
import { getUserLevel, ALL_LEVELS_INFO } from "@/lib/userLevels";
import { formatRole, ROLE_OPTIONS_FOR_REFERRAL } from "@/lib/roleConstants";

export default function ReferralsClient({ initialReferrers, initialWallets, initialCommissions }) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("REFERANSLAR"); // REFERANSLAR, CÜZDANLAR, EKLE

  // Add Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [referrerId, setReferrerId] = useState("");
  const [addError, setAddError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const handleAddReferrer = async (e) => {
    e.preventDefault();
    setAddError("");
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("referralCode", referralCode);
    formData.append("role", role);
    if (referrerId) formData.append("referrerId", referrerId);

    startTransition(async () => {
      const res = await addReferrer(formData);
      if (res?.error) {
        setAddError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Kullanıcı başarıyla eklendi.");
        setName(""); setUsername(""); setPassword(""); setReferralCode(""); setRole("TEACHER"); setReferrerId("");
        setActiveTab("REFERANSLAR");
      }
    });
  };

  const handleDeleteReferrer = async (id, name) => {
    const confirmed = await customConfirm(`${name} adlı referansı silmek istediğinize emin misiniz?`);
    if (confirmed) {
      startTransition(async () => {
        const res = await deleteReferrer(id);
        if (res?.error) toast.error(res.error);
        else toast.success("Referans silindi.");
      });
    }
  };

  const handleWithdraw = async (walletId, amount, userName) => {
    const confirmed = await customConfirm(`${userName} adlı kullanıcıya ait ₺${amount} bakiyesinin ödendiğini onaylıyor musunuz? (Bu işlem bakiyeyi sıfırlayacaktır)`);
    if (confirmed) {
      startTransition(async () => {
        const res = await withdrawWalletBalance(walletId, amount);
        if (res?.error) toast.error(res.error);
        else toast.success("Ödeme başarıyla kaydedildi.");
      });
    }
  };

  const handleUpdateIban = async (id, currentIban) => {
    const newIban = await customPrompt("Yeni Banka / IBAN Bilgisini Girin:", currentIban || "");
    if (newIban !== null) {
      startTransition(async () => {
        const res = await updateReferrerIban(id, newIban);
        if (res?.error) toast.error(res.error);
        else toast.success("Banka bilgileri güncellendi!");
      });
    }
  };

  // Sort Referrers by Student Count (Leaderboard Style)
  const sortedReferrers = [...initialReferrers].sort((a, b) => b.referrals.length - a.referrals.length);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn-sm ${activeTab === 'REFERANSLAR' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'REFERANSLAR' ? 'transparent' : '', border: activeTab !== 'REFERANSLAR' ? '1px solid rgba(255,255,255,0.2)' : 'none', color: activeTab !== 'REFERANSLAR' ? 'white' : '' }}
          onClick={() => setActiveTab('REFERANSLAR')}
        >
          Referans Listesi
        </button>
        <button 
          className={`btn-sm ${activeTab === 'CÜZDANLAR' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'CÜZDANLAR' ? 'transparent' : '', border: activeTab !== 'CÜZDANLAR' ? '1px solid rgba(255,255,255,0.2)' : 'none', color: activeTab !== 'CÜZDANLAR' ? 'white' : '' }}
          onClick={() => setActiveTab('CÜZDANLAR')}
        >
          Cüzdan Ödemeleri ({initialWallets?.length || 0})
        </button>
        <button 
          className={`btn-sm ${activeTab === 'KOMISYONLAR' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'KOMISYONLAR' ? 'transparent' : '', border: activeTab !== 'KOMISYONLAR' ? '1px solid rgba(255,255,255,0.2)' : 'none', color: activeTab !== 'KOMISYONLAR' ? 'white' : '' }}
          onClick={() => setActiveTab('KOMISYONLAR')}
        >
          Komisyon Akışı
        </button>
        <button 
          className={`btn-sm ${activeTab === 'KADEMELER' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'KADEMELER' ? 'transparent' : '', border: activeTab !== 'KADEMELER' ? '1px solid rgba(255,255,255,0.2)' : 'none', color: activeTab !== 'KADEMELER' ? 'white' : '' }}
          onClick={() => setActiveTab('KADEMELER')}
        >
          🏆 10 Kariyer Kademesi
        </button>
        <button 
          className={`btn-sm ${activeTab === 'EKLE' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'EKLE' ? 'transparent' : '', border: activeTab !== 'EKLE' ? '1px solid rgba(255,255,255,0.2)' : 'none', marginLeft: 'auto', color: activeTab !== 'EKLE' ? 'white' : '' }}
          onClick={() => setActiveTab('EKLE')}
        >
          + Yeni Kayıt Ekle
        </button>

        <div className="tooltip-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '0.5rem', cursor: 'pointer' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '50%', fontWeight: 'bold' }}>⏳</span>
          <div className="tooltip-text" style={{ 
            visibility: 'hidden', 
            width: '300px', 
            backgroundColor: '#1e293b', 
            color: '#f8fafc', 
            textAlign: 'left', 
            borderRadius: '8px', 
            padding: '1rem', 
            position: 'absolute', 
            zIndex: 1, 
            top: '120%', 
            right: '0', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.85rem',
            lineHeight: '1.4'
          }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#10b981' }}>Sistem Nasıl Çalışır?</strong>
            Öğrenci referans referansıyla sisteme kayıt olduğunda, kayıt olurken seçtiği <strong>Eğitim Paketi Süresi</strong> ile Ayarlar kısmında belirlediğiniz <strong>Standart Komisyon Tutarı</strong> çarpılır.<br/><br/>
            Örneğin 15 TL komisyon oranınız var ve öğrenci 6 aylık paket ile kayıt oldu. Siz öğrenciyi onayladığınızda referansnin hesabına otomatik olarak (15 x 6 = 90 TL) yansıtılır.
          </div>
          <style jsx>{`
            .tooltip-container:hover .tooltip-text {
              visibility: visible;
            }
          `}</style>
        </div>
      </div>

      {/* TAB CONTENT: REFERANSLAR */}
      {activeTab === 'REFERANSLAR' && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referans Adı</th>
                <th>Kullanıcı Adı</th>
                <th>Referans Kodu</th>
                <th>Gelir Senaryosu</th>
                <th>👤 Öğrenci Sayısı</th>
                <th>Toplam Kazanç</th>
                <th>Banka / IBAN</th>
                <th>Ağ Detayı</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {sortedReferrers.map((referrer, index) => {
                const totalEarned = referrer.commissionsEarned.reduce((sum, c) => sum + c.amount, 0);
                const isTop = index === 0 && referrer.referrals.length > 0;
                const levelInfo = getUserLevel(referrer.role, referrer.referrals.length);

                return (
                  <React.Fragment key={referrer.id}>
                  <tr style={{ background: isTop ? 'rgba(251, 191, 36, 0.05)' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{ fontWeight: isTop ? 'bold' : 'normal' }}>
                          {isTop ? <span>⭐ </span> : null}
                          <span>{referrer.name}</span>
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: `${levelInfo.color}15`, borderRadius: '8px', border: `1px solid ${levelInfo.color}40`, color: levelInfo.color, whiteSpace: 'nowrap', width: 'fit-content' }}>
                          {levelInfo.icon} {levelInfo.title}
                        </span>
                      </div>
                    </td>
                    <td>{referrer.username}</td>
                    <td style={{ fontWeight: 'bold', color: '#10b981' }}>{referrer.referralCode}</td>
                    <td><span style={{ padding: '0.2rem 0.55rem', borderRadius: '8px', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontWeight: 700 }}>Senaryo {referrer.referralScenario || 'A'}</span></td>
                    <td style={{ fontWeight: 'bold', color: isTop ? '#fbbf24' : 'inherit' }}>{referrer.referrals.length}</td>
                    <td>₺{totalEarned}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {referrer.ibanDetails || "Girilemedi"}
                        </span>
                        <button 
                          className="btn-sm" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => handleUpdateIban(referrer.id, referrer.ibanDetails)}
                        >
                          Ü Düzenle
                        </button>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn-sm"
                        onClick={() => setExpandedId(expandedId === referrer.id ? null : referrer.id)}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
                      >
                        {expandedId === referrer.id ? 'Gizle' : 'Ağı Gör'}
                      </button>
                    </td>
                    <td>
                      <button 
                        className="btn-sm btn-danger" 
                        onClick={() => handleDeleteReferrer(referrer.id, referrer.name)}
                        disabled={isPending}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                  
                  {/* EXPANDED NETWORK ROW */}
                  {expandedId === referrer.id && (
                    <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <td colSpan="9" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>{referrer.name} Ağ Detayı</h4>
                        {referrer.referrals.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)' }}>Bu kullanıcının altında kimse yok.</p>
                        ) : (
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {referrer.referrals.map(refUser => {
                              const refUserLevel = getUserLevel(refUser.role, refUser._count?.referrals || refUser.referrals?.length || 0);
                              return (
                                <div key={refUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                  <div>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{refUser.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({refUser.username})</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ 
                                      padding: '0.2rem 0.5rem', 
                                      borderRadius: '8px', 
                                      fontSize: '0.75rem',
                                      background: `${refUserLevel.color}15`,
                                      border: `1px solid ${refUserLevel.color}40`,
                                      color: refUserLevel.color,
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {refUserLevel.icon} {refUserLevel.title}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                      Kayıt: {new Date(refUser.createdAt).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
              {initialReferrers.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>Henüz kayıtlı referans yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: KOMISYONLAR */}
      {activeTab === 'KOMISYONLAR' && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Komisyon Alan (Referans)</th>
                <th>Kaynak / Öğrenci</th>
                <th>İşlem / Ders</th>
                <th>Tutar</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {initialCommissions?.map(comm => (
                <tr key={comm.id}>
                  <td>{new Date(comm.createdAt).toLocaleString('tr-TR')}</td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{comm.user?.name}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatRole(comm.user?.role)}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 'bold' }}>{comm.sourceUser?.name}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatRole(comm.sourceUser?.role)}</div>
                  </td>
                  <td>
                    {comm.lesson ? (
                      <div>
                        <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>🎓 Canlı Ders</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{comm.lesson.title}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#60a5fa', fontSize: '0.9rem' }}>📦 Paket / Abonelik Kaydı</span>
                    )}
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 'bold' }}>₺{comm.amount.toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      background: comm.status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: comm.status === 'PAID' ? '#10b981' : '#fbbf24'
                    }}>
                      {comm.status === 'PAID' ? 'Ödendi / Cüzdanda' : 'Bekliyor'}
                    </span>
                  </td>
                </tr>
              ))}
              {(!initialCommissions || initialCommissions.length === 0) && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Henüz komisyon hareketi bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: CUZDANLAR */}
      {activeTab === 'CÜZDANLAR' && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kullanıcı (Referans / Veli)</th>
                <th>Rol</th>
                <th>Çekilebilir Bakiye</th>
                <th>Banka / IBAN</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {initialWallets?.map(wallet => {
                const walletUserLevel = getUserLevel(wallet.user.role, wallet.user._count?.referrals || wallet.user.referrals?.length || 0);
                return (
                <tr key={wallet.id}>
                  <td style={{ fontWeight: 'bold' }}>{wallet.user.name || wallet.user.username}</td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.15rem 0.5rem', 
                      background: `${walletUserLevel.color}15`, 
                      borderRadius: '8px', 
                      border: `1px solid ${walletUserLevel.color}40`, 
                      color: walletUserLevel.color, 
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {walletUserLevel.icon} {walletUserLevel.title}
                    </span>
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>₺{wallet.balance.toFixed(2)}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {wallet.user.ibanDetails || "Belirtilmemiş"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-sm btn-success"
                      onClick={() => handleWithdraw(wallet.id, wallet.balance, wallet.user.name || wallet.user.username)}
                      disabled={isPending || wallet.balance <= 0}
                      style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', opacity: isPending ? 0.5 : 1, fontWeight: 'bold' }}
                    >
                      ✅ Bakiyeyi Öde (Sıfırla)
                    </button>
                  </td>
                </tr>
                );
              })}
              {(!initialWallets || initialWallets.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Şu an çekilebilir bakiyesi olan kullanıcı bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: KADEMELER */}
      {activeTab === 'KADEMELER' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 0.4rem 0' }}>🏆 Merkür Kariyer Kademeleri (10 Kademe)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, maxWidth: '650px' }}>
                Öğretmenler kayıt ettikleri öğrenci sayısına göre otomatik olarak kademe atlarlar veya Yönetici tarafından doğrudan bu ünvanlara atanabilirler.
              </p>
            </div>
            <button className="btn-primary" onClick={() => setActiveTab('EKLE')}>
              + Bu Kademede Eğitmen Ekle
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {ALL_LEVELS_INFO.map((lvl) => (
              <div key={lvl.role} style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: `1px solid ${lvl.color}35`,
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 4px 20px -5px ${lvl.color}15`
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: lvl.color }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.8rem' }}>{lvl.icon}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '8px', 
                    background: `${lvl.color}15`, 
                    color: lvl.color,
                    border: `1px solid ${lvl.color}40`
                  }}>
                    {lvl.minReferrals > 0 ? `${lvl.minReferrals}+ Öğrenci` : 'Temel Kademe'}
                  </span>
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: '0 0 0.3rem 0', fontWeight: '700' }}>{lvl.title}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: '1.4' }}>{lvl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EKLE */}
      {activeTab === 'EKLE' && (
        <div style={{ maxWidth: '500px' }}>
          <h3>Yeni Referans Oluştur</h3>
          {addError && <div className="error-message" style={{ margin: '1rem 0', color: '#ef4444' }}>{addError}</div>}
          <form onSubmit={handleAddReferrer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Referans Adı Soyadı</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Kullanıcı Adı (Giriş için)</label>
              <input type="text" className="input-field" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Referans Kodu (Örn: Merkür2026)</label>
              <input type="text" className="input-field" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="Örn: Merkür2026" required />
            </div>
            <div className="form-group">
              <label>Kullanıcı Rolü</label>
              <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                {ROLE_OPTIONS_FOR_REFERRAL.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bağlı Olduğu Lider / Üst Referans (Opsiyonel)</label>
              <select className="input-field" value={referrerId} onChange={e => setReferrerId(e.target.value)}>
                <option value="">-- Bağımsız (Üst Referansı Yok) --</option>
                {initialReferrers.map(ref => (
                  <option key={ref.id} value={ref.id}>{ref.name} ({formatRole(ref.role)})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={isPending} style={{ marginTop: '1rem' }}>
              {isPending ? 'Ekleniyor...' : 'Kullanıcıyı Kaydet'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
