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

  const studentsWithoutTeacher = await prisma.user.findMany({
    where: { role: "STUDENT", assignedTeacherId: null },
    select: { id: true, referrerId: true, lessonsTaken: { select: { teacherId: true }, orderBy: { createdAt: "desc" }, take: 1 } }
  });
  let teacherAssignments = 0;
  for (const student of studentsWithoutTeacher) {
    let teacherId = student.lessonsTaken[0]?.teacherId || null;
    let currentId = student.referrerId;
    const visited = new Set();
    while (!teacherId && currentId && !visited.has(currentId) && visited.size < 30) {
      visited.add(currentId);
      const candidate = await prisma.user.findUnique({ where: { id: currentId }, select: { id: true, role: true, referrerId: true } });
      if (!candidate) break;
      if (teacherRoles.has(candidate.role)) teacherId = candidate.id;
      currentId = candidate.referrerId;
    }
    if (teacherId) {
      await prisma.user.update({ where: { id: student.id }, data: { assignedTeacherId: teacherId } });
      teacherAssignments++;
    }
  }

  console.log(`BACKFILL_OK scenarios=${users.length} teacherAssignments=${teacherAssignments}`);
}

main()
  .catch((error) => {
    console.error("BACKFILL_FAILED", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
