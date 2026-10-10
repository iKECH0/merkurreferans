import { TEACHER_ROLES } from "./roleConstants";

export const REVENUE_SCENARIOS = [
  { key: "A", title: "Kurum Öğrencisi / Öğretmen Referansı", description: "Kurum öğrencisinden oluşan gelir, öğretmen ağı ve kurum arasında paylaşılır." },
  { key: "B", title: "Öğretmenin Kendi Öğrencisi", description: "Öğretmenin sisteme kazandırdığı öğrenciden oluşan gelir öğretmen ağı ve kurum arasında paylaşılır." },
  { key: "C", title: "Veli Referansı", description: "Gelir; öğretmen ağı, referansı gerçekleştiren veli ve kurum arasında paylaşılır." },
  { key: "D", title: "Öğrenci Referansı", description: "Gelir; öğretmen ağı, referansı gerçekleştiren öğrenci ve kurum arasında paylaşılır." }
];

export const PAYOUT_ROWS = [
  { key: "PRO_TEACHER", label: "Profesyonel Öğretmen" },
  { key: "PRESTIGE_TEACHER", label: "Prestijli Öğretmen" },
  { key: "ELITE_TEACHER", label: "Seçkin Öğretmen" },
  { key: "HEAD_TEACHER", label: "Başöğretmen" },
  { key: "EXPERT_TEACHER", label: "Uzman Öğretmen" },
  { key: "LEADER_TEACHER", label: "Lider Öğretmen" },
  { key: "ACTIVE_TEACHER", label: "Aktif Öğretmen" },
  { key: "TEACHER", label: "Dersi Anlatan Öğretmen" },
  { key: "PARENT", label: "Veli" },
  { key: "STUDENT", label: "Öğrenci" },
  { key: "INSTITUTION", label: "Kurum" }
];

const BASE_TEACHER_SHARES = {
  PRO_TEACHER: 1, PRESTIGE_TEACHER: 1.5, ELITE_TEACHER: 2, HEAD_TEACHER: 2.5,
  EXPERT_TEACHER: 3, LEADER_TEACHER: 3.5, ACTIVE_TEACHER: 30, TEACHER: 30
};

function scenarioDefaults(key) {
  const referralShare = key === "C" || key === "D" ? 15 : 0;
  return {
    ...BASE_TEACHER_SHARES,
    PARENT: key === "C" ? referralShare : 0,
    STUDENT: key === "D" ? referralShare : 0,
    INSTITUTION: 26.5 - referralShare
  };
}

export function createDefaultScenarioShares() {
  return Object.fromEntries(REVENUE_SCENARIOS.map(({ key }) => [key, scenarioDefaults(key)]));
}

export function normalizeScenarioShares(value) {
  const defaults = createDefaultScenarioShares();
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;

  if (REVENUE_SCENARIOS.some(({ key }) => value[key])) {
    for (const { key: scenario } of REVENUE_SCENARIOS) {
      for (const { key: row } of PAYOUT_ROWS) {
        const candidate = Number(value?.[scenario]?.[row]);
        if (Number.isFinite(candidate) && candidate >= 0 && candidate <= 100) defaults[scenario][row] = candidate;
      }
    }
    return defaults;
  }

  for (const { key: scenario } of REVENUE_SCENARIOS) {
    const legacy = value?.TEACHER?.[scenario];
    if (!legacy) continue;
    defaults[scenario].TEACHER = Number(legacy.teacher) || defaults[scenario].TEACHER;
    defaults[scenario].PARENT = Number(legacy.parent) || 0;
    defaults[scenario].STUDENT = Number(legacy.student) || 0;
    const allocated = PAYOUT_ROWS.filter(({ key }) => key !== "INSTITUTION").reduce((sum, { key }) => sum + defaults[scenario][key], 0);
    defaults[scenario].INSTITUTION = Math.max(0, 100 - allocated);
  }
  return defaults;
}

export function isTeacherReferralRole(role) {
  return TEACHER_ROLES.includes(role);
}

export function getScenarioForReferrerRole(role) {
  if (isTeacherReferralRole(role)) return "B";
  if (role === "PARENT") return "C";
  if (role === "STUDENT") return "D";
  return "A";
}

export function getRevenueScenario(student) {
  if (["A", "B", "C", "D"].includes(student?.referralScenario)) return student.referralScenario;
  if (!student?.referrerId) return "A";
  return getScenarioForReferrerRole(student.referrerRoleAtJoin || student.referrer?.role);
}
