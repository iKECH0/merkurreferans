"use client";
import { useState, useTransition } from "react";
import { addTeacherToTeam } from "./actions";
import toast from 'react-hot-toast';
import { getUserLevel } from "@/lib/userLevels";

export default function TeamClient({ initialTeam, allUsersForTree, currentUserId }) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("EKIP"); // EKIP, EKLE, ŞEMA

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [role, setRole] = useState("TEACHER");

  const buildTree = (users, parentId) => {
    if (!users) return [];
    return users
      .filter(u => u.referrerId === parentId)
      .map(u => ({
        ...u,
        children: buildTree(users, u.id)
      }));
  };

  const ReferralNode = ({ node, level = 0 }) => {
    const levelInfo = getUserLevel(node.role, node._count?.referrals || node.referrals?.length || 0);
    return (
      <div style={{ marginLeft: level * 25 + 'px', borderLeft: level > 0 ? '2px dashed rgba(255,255,255,0.2)' : 'none', paddingLeft: level > 0 ? '15px' : '0', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: level === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: level === 0 ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
          {level > 0 && <span style={{ color: 'var(--text-muted)' }}>↳</span>}
          <div style={{ fontWeight: 'bold', color: level === 0 ? '#60a5fa' : 'var(--text-main)' }}>{node.name || node.username}</div>
          <span style={{ 
            fontSize: '0.7rem', 
            padding: '0.15rem 0.5rem', 
            background: `${levelInfo.color}15`, 
            borderRadius: '8px', 
            border: `1px solid ${levelInfo.color}40`, 
            color: levelInfo.color,
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {levelInfo.icon} {levelInfo.title}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Kayıt: {new Date(node.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
        {node.children && node.children.length > 0 && (
          <div style={{ marginTop: '5px' }}>
            {node.children.map(child => <ReferralNode key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  const myNetwork = buildTree(allUsersForTree, currentUserId);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("referralCode", referralCode);
    formData.append("role", role);

    startTransition(async () => {
      const res = await addTeacherToTeam(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Referans başarıyla ekibine katıldı.");
        setName(""); setUsername(""); setPassword(""); setReferralCode(""); setRole("TEACHER");
        setActiveTab("EKIP");
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn-sm ${activeTab === 'EKIP' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'EKIP' ? 'transparent' : '', border: activeTab !== 'EKIP' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
          onClick={() => setActiveTab('EKIP')}
        >
          Referans Kadrom
        </button>
        <button 
          className={`btn-sm ${activeTab === 'ŞEMA' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'ŞEMA' ? 'transparent' : '', border: activeTab !== 'ŞEMA' ? '1px solid rgba(255,255,255,0.2)' : 'none' }}
          onClick={() => setActiveTab('ŞEMA')}
        >
          🌳 Referans Ağ Şeması
        </button>
        <button 
          className={`btn-sm ${activeTab === 'EKLE' ? 'btn-primary' : ''}`}
          style={{ background: activeTab !== 'EKLE' ? 'transparent' : '', border: activeTab !== 'EKLE' ? '1px solid rgba(255,255,255,0.2)' : 'none', marginLeft: 'auto' }}
          onClick={() => setActiveTab('EKLE')}
        >
          + Yeni Referans Ekle
        </button>
      </div>

      {activeTab === 'EKIP' && (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referans Adı</th>
                <th>Kullanıcı Adı</th>
                <th>Kademe / Unvan</th>
                <th>Referans Kodu</th>
                <th>Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {initialTeam.map((teacher) => {
                const teacherLevel = getUserLevel(teacher.role, teacher._count?.referrals || teacher.referrals?.length || 0);
                return (
                  <tr key={teacher.id}>
                    <td style={{ fontWeight: 'bold' }}>{teacher.name}</td>
                    <td>{teacher.username}</td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.15rem 0.5rem', 
                        background: `${teacherLevel.color}15`, 
                        borderRadius: '8px', 
                        border: `1px solid ${teacherLevel.color}40`, 
                        color: teacherLevel.color,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        {teacherLevel.icon} {teacherLevel.title}
                      </span>
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 'bold' }}>{teacher.referralCode}</td>
                    <td>{new Date(teacher.createdAt).toLocaleDateString('tr-TR')}</td>
                  </tr>
                );
              })}
              {initialTeam.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Ekibinizde henüz aktif referans bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'EKLE' && (
        <div style={{ maxWidth: '500px' }}>
          <h3>Alt Referans Hesabı Oluştur</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Buradan oluşturacağınız referanslar, doğrudan size (Lider Referans olarak) bağlanır. Onların verdiği derslerden, yönetim tarafından belirlenen pasif gelirleri kazanırsınız.
          </p>
          <form onSubmit={handleAddTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Referans Adı Soyadı</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Kullanıcı Adı</label>
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
              <label>Hesap Türü (Alt Grup)</label>
              <select className="input-field" value={role} onChange={e => setRole(e.target.value)} required style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }}>
                <option value="TEACHER">👨‍🏫 Öğretmen</option>
                <option value="STUDENT">🎓 Öğrenci</option>
                <option value="PARENT">🏠 Veli</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={isPending} style={{ marginTop: '1rem' }}>
              {isPending ? 'Ekleniyor...' : 'Referansı Kaydet'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'ŞEMA' && (
        <div style={{ padding: '1rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Alt Referans ve Öğrenci Ağı</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Size bağlı olan referansları ve onların altındaki öğrencileri (veya diğer referansları) aşağıdan hiyerarşik bir şekilde görebilirsiniz.</p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '12px' }}>
            {myNetwork && myNetwork.length > 0 ? (
              myNetwork.map(rootNode => (
                <ReferralNode key={rootNode.id} node={rootNode} level={0} />
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Ekibinizde henüz kayıtlı referans bulunmamaktadır.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
