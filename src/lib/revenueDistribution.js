import { normalizeScenarioShares, getRevenueScenario } from "./revenueScenarios";
import { TEACHER_ROLES } from "./roleConstants";

export async function findTeacherInReferralChain(db, startUserId) {
  let currentId = startUserId;
  const visited = new Set();
  while (currentId && !visited.has(currentId) && visited.size < 30) {
    visited.add(currentId);
    const user = await db.user.findUnique({
      where: { id: currentId },
      select: { id: true, role: true, referrerId: true }
    });
    if (!user) return null;
    if (TEACHER_ROLES.includes(user.role)) return user;
    currentId = user.referrerId;
  }
  return null;
}

async function buildTeacherChain(db, teacher) {
  if (!teacher) return [];
  const chain = [];
  const visited = new Set();
  let current = teacher;
  while (current && !visited.has(current.id) && visited.size < 30) {
    visited.add(current.id);
    chain.push(current);
    if (!current.referrerId) break;
    current = await db.user.findUnique({
      where: { id: current.referrerId },
      select: { id: true, role: true, referrerId: true }
    });
  }
  return chain;
}

async function creditWallet(db, { recipientId, sourceUserId, lessonId, amount, percentage, scenario, payoutType, configuration, description }) {
  if (!recipientId || amount <= 0) return false;
  const wallet = await db.wallet.upsert({
    where: { userId: recipientId },
    update: {},
    create: { userId: recipientId }
  });
  await db.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } });
  await db.walletTransaction.create({ data: { walletId: wallet.id, amount, type: "EARNED", description } });
  await db.commission.create({
    data: { userId: recipientId, sourceUserId, lessonId, amount, status: "PAID", scenario, payoutType, percentage, configuration }
  });
  return true;
}

export async function distributeRevenue(db, { sourceUser, assignedTeacher, lessonId = null, totalRevenue, type, description, settings }) {
  const scenario = getRevenueScenario(sourceUser);
  const allShares = normalizeScenarioShares(settings?.scenarioShares);
  const shares = allShares[scenario];
  const configuration = { scenario, shares, totalRevenue, type };
  const teacherChain = await buildTeacherChain(db, assignedTeacher);
  const recipientsByRole = new Map();
  for (const member of teacherChain) {
    if (TEACHER_ROLES.includes(member.role) && !recipientsByRole.has(member.role)) recipientsByRole.set(member.role, member);
  }

  let institutionPercent = shares.INSTITUTION;
  const payouts = [];
  const pay = async (row, recipient, label) => {
    const percentage = Number(shares[row] || 0);
    if (percentage <= 0) return;
    if (!recipient) {
      institutionPercent += percentage;
      return;
    }
    const amount = totalRevenue * (percentage / 100);
    await creditWallet(db, {
      recipientId: recipient.id,
      sourceUserId: sourceUser.id,
      lessonId,
      amount,
      percentage,
      scenario,
      payoutType: row,
      configuration,
      description: `${description} · ${label} (%${percentage})`
    });
    payouts.push({ recipientId: recipient.id, row, percentage, amount });
  };

  // The instructor share is independent from the instructor's career-level share.
  await pay("TEACHER", assignedTeacher, "Dersi anlatan öğretmen payı");
  for (const role of TEACHER_ROLES.filter((role) => role !== "TEACHER")) {
    await pay(role, recipientsByRole.get(role), `${role} kariyer payı`);
  }

  const directReferrer = sourceUser.referrerId
    ? await db.user.findUnique({ where: { id: sourceUser.referrerId }, select: { id: true } })
    : null;
  await pay("PARENT", scenario === "C" ? directReferrer : null, "Veli referans payı");
  await pay("STUDENT", scenario === "D" ? directReferrer : null, "Öğrenci referans payı");

  const institutionAmount = totalRevenue * (institutionPercent / 100);
  if (institutionAmount > 0) {
    await db.institutionRevenue.create({
      data: {
        sourceUserId: sourceUser.id,
        lessonId,
        scenario,
        amount: institutionAmount,
        percentage: institutionPercent,
        configuration,
        type,
        description: `${description} · Kurum payı (%${institutionPercent})`
      }
    });
  }
  return { scenario, payouts, institutionPercent, institutionAmount };
}
