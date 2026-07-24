import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Kurum Ayarları | MERKÜR ODAK Admin",
};

export default async function SettingsPage() {
  const currentSettings = await prisma.settings.findUnique({
    where: { id: "GLOBAL" }
  });

  return (
    <div className="dashboard-wrapper">
      <h2>Kurumsal Ayarlar</h2>
      <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
        Platformun görünümünü ve PDF raporlarındaki logolarınızı buradan yönetebilirsiniz.
      </p>

      <SettingsClient currentSettings={currentSettings} />
    </div>
  );
}
