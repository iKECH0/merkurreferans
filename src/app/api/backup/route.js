import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const [users, wallets, walletTransactions, lessons, settings, commissions, deletionRequests] = await prisma.$transaction([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.wallet.findMany({ orderBy: { updatedAt: "asc" } }),
    prisma.walletTransaction.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.lesson.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.settings.findMany({ orderBy: { id: "asc" } }),
    prisma.commission.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.deletionRequest.findMany({ orderBy: { createdAt: "asc" } })
  ]);

  const createdAt = new Date();
  const body = JSON.stringify({
    metadata: { format: "merkur-full-backup-v1", createdAt: createdAt.toISOString() },
    data: { users, wallets, walletTransactions, lessons, settings, commissions, deletionRequests }
  }, null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="merkur-full-${createdAt.toISOString().replace(/[:.]/g, "-")}.json"`,
      "Cache-Control": "no-store"
    }
  });
}
