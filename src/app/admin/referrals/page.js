import { prisma } from "@/lib/prisma";
import ReferralsClient from "./ReferralsClient";

export default async function ReferralsPage() {
  const referrers = await prisma.user.findMany({
    where: { 
      role: { in: ["REFERRER", "LEADER_TEACHER", "TEACHER", "PARENT"] }
    },
    include: {
      referrals: true,
      commissionsEarned: true,
      wallet: true
    },
    orderBy: { createdAt: "desc" }
  });

  const walletsWithBalance = await prisma.wallet.findMany({
    where: { balance: { gt: 0 } },
    include: {
      user: true
    },
    orderBy: { balance: "desc" }
  });

  const allCommissions = await prisma.commission.findMany({
    include: {
      user: { select: { name: true, username: true, role: true } },
      sourceUser: { select: { name: true, username: true, role: true } },
      lesson: { select: { title: true, startTime: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100 // Son 100 işlem
  });

  return (
    <div className="dashboard-wrapper">
      <div className="top-bar-actions" style={{ marginBottom: '2rem' }}>
        <h2>Referans ve Cüzdan Yönetimi</h2>
      </div>

      <ReferralsClient initialReferrers={referrers} initialWallets={walletsWithBalance} initialCommissions={allCommissions} />
    </div>
  );
}
