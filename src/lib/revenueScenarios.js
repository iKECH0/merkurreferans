import { TEACHER_ROLES } from "./roleConstants";

export const REVENUE_SCENARIOS = [
  { key: "A", title: "Kurum Öğrencisi / Öğretmen Referansı", description: "Öğrenci hâlihazırda Merkür Eğitim Akademisi öğrencisidir. Gelir kurum ve öğretmen arasında paylaşılır." },
  { key: "B", title: "Öğretmenin Kendi Öğrencisi", description: "Öğretmen kendi çevresinden veya öğrencileri arasından yeni bir öğrenciyi sisteme dahil eder." },
  { key: "C", title: "Veli Referansı", description: "Mevcut bir veli yeni öğrenci veya veli yönlendirir. Gelir kurum, öğretmen ve yönlendiren veli arasında paylaşılır." },
  { key: "D", title: "Öğrenci Referansı", description: "Mevcut bir öğrenci başka bir öğrenciyi sisteme kazandırır. Gelir kurum, öğretmen ve yönlendiren öğrenci arasında paylaşılır." }
];

export const SHARE_PARTICIPANTS = [
  { key: "institution", label: "Kurum" },
  { key: "teacher", label: "Öğretmen" },
  { key: "parent", label: "Veli" },
  { key: "student", label: "Öğrenci" }
];

const SCENARIO_DEFAULTS = {
  A: { institution: 50, teacher: 50, parent: 0, student: 0 },
  B: { institution: 35, teacher: 65, parent: 0, student: 0 },
  C: { institution: 35, teacher: 50, parent: 15, student: 0 },
  D: { institution: 35, teacher: 50, parent: 0, student: 15 }
};

export function createDefaultScenarioShares(legacySettings = {}) {
  return Object.fromEntries(TEACHER_ROLES.map((role) => [
    role,
    Object.fromEntries(REVENUE_SCENARIOS.map(({ key }) => [
      key,
      {
        ...SCENARIO_DEFAULTS[key],
        ...(key === "A" && Number.isFinite(legacySettings.lessonTeacherShareA)
          ? { teacher: legacySettings.lessonTeacherShareA, institution: 100 - legacySettings.lessonTeacherShareA }
          : {}),
        ...(key === "B" && Number.isFinite(legacySettings.lessonTeacherShareB)
          ? { teacher: legacySettings.lessonTeacherShareB, institution: 100 - legacySettings.lessonTeacherShareB }
          : {})
      }
    ]))
  ]));
}

export function normalizeScenarioShares(value, legacySettings = {}) {
  const defaults = createDefaultScenarioShares(legacySettings);
  if (!value || typeof value !== "object" || Array.isArray(value)) return defaults;

  for (const role of TEACHER_ROLES) {
    for (const { key } of REVENUE_SCENARIOS) {
      for (const { key: participant } of SHARE_PARTICIPANTS) {
        const candidate = Number(value?.[role]?.[key]?.[participant]);
        if (Number.isFinite(candidate) && candidate >= 0 && candidate <= 100) {
          defaults[role][key][participant] = candidate;
        }
      }
    }
  }
  return defaults;
}

export function getRevenueScenario(student, teacherId) {
  if (["A", "B", "C", "D"].includes(student?.referralScenario)) return student.referralScenario;
  if (!student?.referrerId) return "A";
  if (student.referrerId === teacherId || isTeacherReferralRole(student.referrerRoleAtJoin || student.referrer?.role)) return "B";
  return getScenarioForReferrerRole(student.referrerRoleAtJoin || student.referrer?.role);
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
