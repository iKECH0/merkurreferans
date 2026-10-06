const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const teacherRoles = new Set([
  "TEACHER", "ACTIVE_TEACHER", "LEADER_TEACHER", "EXPERT_TEACHER",
  "HEAD_TEACHER", "ELITE_TEACHER", "PRESTIGE_TEACHER", "PRO_TEACHER"
]);

function scenarioFor(role) {
  if (teacherRoles.has(role)) return "B";
  if (role === "PARENT") return "C";
  if (role === "STUDENT") return "D";
  return "A";
}

async function main() {
  const users = await prisma.user.findMany({
    where: { referralScenario: null },
    select: { id: true, referrerId: true, referrer: { select: { role: true } } }
  });

  for (const user of users) {
    const referrerRoleAtJoin = user.referrer?.role || null;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        referrerRoleAtJoin,
        referralScenario: user.referrerId ? scenarioFor(referrerRoleAtJoin) : "A"
      }
    });
  }

  console.log(`BACKFILL_OK updated=${users.length}`);
}

main()
  .catch((error) => {
    console.error("BACKFILL_FAILED", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
