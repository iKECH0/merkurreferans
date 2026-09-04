export const ALL_LEVELS_INFO = [
  { role: 'STUDENT', title: 'Öğrenci', icon: '🎓', color: '#38bdf8', badgeClass: 'badge-student', minReferrals: 0, desc: 'Canlı derslere katılan öğrenci' },
  { role: 'TEACHER', title: 'Öğretmen', icon: '👨‍🏫', color: '#94a3b8', badgeClass: 'badge-teacher', minReferrals: 0, desc: 'Başlangıç kademesi eğitmen' },
  { role: 'ACTIVE_TEACHER', title: 'Aktif Öğretmen', icon: '🌱', color: '#84cc16', badgeClass: 'badge-active', minReferrals: 5, desc: '5+ öğrenciye ulaşan eğitmen' },
  { role: 'LEADER_TEACHER', title: 'Lider Öğretmen', icon: '🚀', color: '#ef4444', badgeClass: 'badge-leader', minReferrals: 10, desc: '10+ öğrenciye ulaşan eğitmen' },
  { role: 'EXPERT_TEACHER', title: 'Uzman Öğretmen', icon: '⭐', color: '#8b5cf6', badgeClass: 'badge-expert', minReferrals: 20, desc: '20+ öğrenciye ulaşan eğitmen' },
  { role: 'HEAD_TEACHER', title: 'Başöğretmen', icon: '🏅', color: '#10b981', badgeClass: 'badge-head', minReferrals: 50, desc: '50+ öğrenciye ulaşan eğitmen' },
  { role: 'ELITE_TEACHER', title: 'Seçkin Öğretmen', icon: '💎', color: '#0ea5e9', badgeClass: 'badge-elite', minReferrals: 100, desc: '100+ öğrenciye ulaşan eğitmen' },
  { role: 'PRESTIGE_TEACHER', title: 'Prestijli Öğretmen', icon: '🏆', color: '#f59e0b', badgeClass: 'badge-prestigious', minReferrals: 250, desc: '250+ öğrenciye ulaşan eğitmen' },
  { role: 'PRO_TEACHER', title: 'Profesyonel Öğretmen', icon: '👑', color: '#fbbf24', badgeClass: 'badge-pro', minReferrals: 500, desc: '500+ öğrenciye ulaşan eğitmen' }
];

export function getUserLevel(role, referralCount = 0) {
  // Yönetici rolü
  if (role === 'ADMIN') return { title: 'Yönetici', icon: '⚡', color: '#ec4899', badgeClass: 'badge-admin' };

  // Öğrenci rolü
  if (role === 'STUDENT') return { title: 'Öğrenci', icon: '🎓', color: '#38bdf8', badgeClass: 'badge-student' };

  // Veli rolü
  if (role === 'PARENT') return { title: 'Veli', icon: '🏠', color: '#94a3b8', badgeClass: 'badge-parent' };

  // 1. Profesyonel Öğretmen (👑)
  if (role === 'PRO_TEACHER' || referralCount >= 500) {
    return { title: 'Profesyonel Öğretmen', icon: '👑', color: '#fbbf24', badgeClass: 'badge-pro', level: 8 };
  }
  // 2. Prestijli Öğretmen (🏆)
  if (role === 'PRESTIGE_TEACHER' || referralCount >= 250) {
    return { title: 'Prestijli Öğretmen', icon: '🏆', color: '#f59e0b', badgeClass: 'badge-prestigious', level: 7 };
  }
  // 3. Seçkin Öğretmen (💎)
  if (role === 'ELITE_TEACHER' || referralCount >= 100) {
    return { title: 'Seçkin Öğretmen', icon: '💎', color: '#0ea5e9', badgeClass: 'badge-elite', level: 6 };
  }
  // 4. Başöğretmen (🏅)
  if (role === 'HEAD_TEACHER' || referralCount >= 50) {
    return { title: 'Başöğretmen', icon: '🏅', color: '#10b981', badgeClass: 'badge-head', level: 5 };
  }
  // 5. Uzman Öğretmen (⭐)
  if (role === 'EXPERT_TEACHER' || referralCount >= 20) {
    return { title: 'Uzman Öğretmen', icon: '⭐', color: '#8b5cf6', badgeClass: 'badge-expert', level: 4 };
  }
  // 6. Lider Öğretmen (🚀)
  if (role === 'LEADER_TEACHER' || referralCount >= 10) {
    return { title: 'Lider Öğretmen', icon: '🚀', color: '#ef4444', badgeClass: 'badge-leader', level: 3 };
  }
  // 7. Aktif Öğretmen (🌱)
  if (role === 'ACTIVE_TEACHER' || referralCount >= 5) {
    return { title: 'Aktif Öğretmen', icon: '🌱', color: '#84cc16', badgeClass: 'badge-active', level: 2 };
  }

  // 8. Öğretmen (👨‍🏫 - Başlangıç)
  return { title: 'Öğretmen', icon: '👨‍🏫', color: '#94a3b8', badgeClass: 'badge-teacher', level: 1 };
}
