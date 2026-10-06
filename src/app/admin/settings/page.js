import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Kurum Ayarları | MERKÜR REFERANS Admin",
  description: "Kurum ayarları ve yapılandırma",
};

export default async function SettingsPage() {
  const [currentSettings, institutionRevenueTotal, recentInstitutionRevenues] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "GLOBAL" } }),
    prisma.institutionRevenue.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.institutionRevenue.findMany({ orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  return (
    <div className="dashboard-wrapper">
      <h2>Kurumsal Ayarlar</h2>
      <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
        Platformun görünümünü ve PDF raporlarındaki logolarınızı buradan yönetebilirsiniz.
      </p>

      <SettingsClient
        currentSettings={currentSettings}
        institutionRevenueSummary={{ total: institutionRevenueTotal._sum.amount || 0, count: institutionRevenueTotal._count }}
        recentInstitutionRevenues={recentInstitutionRevenues}
      />
    </div>
  );
}
