export function getUserLevel(role, referralCount = 0) {
  // Öğrenci rolü
  if (role === 'STUDENT') return { title: 'Öğrenci', icon: '🎓', color: '#38bdf8', badgeClass: 'badge-student' };

  // Eğitmen / Bayi Kademeleri — referral sayısına göre otomatik unvan
  if (referralCount >= 500) return { title: 'Profesyonel Öğretmen', icon: '👑', color: '#fbbf24', badgeClass: 'badge-pro' };
  if (referralCount >= 250) return { title: 'Prestijli Öğretmen', icon: '🏆', color: '#f59e0b', badgeClass: 'badge-prestigious' };
  if (referralCount >= 100) return { title: 'Seçkin Öğretmen', icon: '💎', color: '#0ea5e9', badgeClass: 'badge-elite' };
  if (referralCount >= 50)  return { title: 'Başöğretmen', icon: '🏅', color: '#10b981', badgeClass: 'badge-head' };
  if (referralCount >= 20)  return { title: 'Uzman Öğretmen', icon: '⭐', color: '#8b5cf6', badgeClass: 'badge-expert' };
  if (referralCount >= 10)  return { title: 'Lider Öğretmen', icon: '🚀', color: '#ef4444', badgeClass: 'badge-leader' };
  if (referralCount >= 5)   return { title: 'Aktif Öğretmen', icon: '🌱', color: '#84cc16', badgeClass: 'badge-active' };

  // Role bazlı fallback (henüz referral yoksa)
  if (role === 'LEADER_TEACHER') return { title: 'Lider Öğretmen', icon: '🚀', color: '#ef4444', badgeClass: 'badge-leader' };
  if (role === 'PARENT') return { title: 'Veli / Bayi', icon: '🏠', color: '#94a3b8', badgeClass: 'badge-parent' };

  // TEACHER veya bilinmeyen eğitmen rolleri
  return { title: 'Öğretmen', icon: '👨‍🏫', color: '#94a3b8', badgeClass: 'badge-teacher' };
}
