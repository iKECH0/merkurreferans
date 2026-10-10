export const TEACHER_ROLES = [
  'TEACHER',
  'ACTIVE_TEACHER',
  'LEADER_TEACHER',
  'EXPERT_TEACHER',
  'HEAD_TEACHER',
  'ELITE_TEACHER',
  'PRESTIGE_TEACHER',
  'PRO_TEACHER'
];

export const ALL_REFERRER_ROLES = [
  ...TEACHER_ROLES,
  'PARENT',
  'REFERRER'
];

export function isTeacherRole(role) {
  return TEACHER_ROLES.includes(role);
}

export function isReferrerRole(role) {
  return ALL_REFERRER_ROLES.includes(role);
}

export const ROLE_LABELS_TR = {
  ADMIN: "Yönetici",
  STUDENT: "Öğrenci",
  TEACHER: "Öğretmen",
  ACTIVE_TEACHER: "Aktif Öğretmen",
  LEADER_TEACHER: "Lider Öğretmen",
  EXPERT_TEACHER: "Uzman Öğretmen",
  HEAD_TEACHER: "Başöğretmen",
  ELITE_TEACHER: "Seçkin Öğretmen",
  PRESTIGE_TEACHER: "Prestijli Öğretmen",
  PRO_TEACHER: "Profesyonel Öğretmen",
  PARENT: "Veli",
  REFERRER: "Referans"
};

export const ROLE_OPTIONS_FOR_REFERRAL = [
  { value: "PRO_TEACHER", label: "👑 Profesyonel Öğretmen (500+ Öğrenci)" },
  { value: "PRESTIGE_TEACHER", label: "🏆 Prestijli Öğretmen (250+ Öğrenci)" },
  { value: "ELITE_TEACHER", label: "💎 Seçkin Öğretmen (100+ Öğrenci)" },
  { value: "HEAD_TEACHER", label: "🏅 Başöğretmen (50+ Öğrenci)" },
  { value: "EXPERT_TEACHER", label: "⭐ Uzman Öğretmen (20+ Öğrenci)" },
  { value: "LEADER_TEACHER", label: "🚀 Lider Öğretmen (10+ Öğrenci)" },
  { value: "ACTIVE_TEACHER", label: "🌱 Aktif Öğretmen (5+ Öğrenci)" },
  { value: "TEACHER", label: "👨‍🏫 Öğretmen" },
  { value: "PARENT", label: "🏠 Veli" },
  { value: "STUDENT", label: "🎓 Öğrenci" }
];

export function formatRole(role) {
  if (!role) return "Belirtilmemiş";
  return ROLE_LABELS_TR[role] || role;
}
