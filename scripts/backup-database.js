const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const prisma = new PrismaClient();

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  // Raw SELECTs keep the backup usable even immediately before a Prisma schema migration.
  // The per-run SQL tag also prevents pooled PostgreSQL connections from reusing a
  // stale SELECT * plan after a column is added.
  const queryTag = `backup_${Date.now()}`;
  const [users, wallets, walletTransactions, lessons, settings, commissions, deletionRequests] = await prisma.$transaction([
    prisma.$queryRawUnsafe(`SELECT * FROM "User" ORDER BY "createdAt" ASC /* ${queryTag}_users */`),
    prisma.$queryRawUnsafe(`SELECT * FROM "Wallet" ORDER BY "updatedAt" ASC /* ${queryTag}_wallets */`),
    prisma.$queryRawUnsafe(`SELECT * FROM "WalletTransaction" ORDER BY "createdAt" ASC /* ${queryTag}_transactions */`),
    prisma.$queryRawUnsafe(`SELECT * FROM "Lesson" ORDER BY "createdAt" ASC /* ${queryTag}_lessons */`),
    prisma.$queryRawUnsafe(`SELECT * FROM "Settings" ORDER BY "id" ASC /* ${queryTag}_settings */`),
    prisma.$queryRawUnsafe(`SELECT * FROM "Commission" ORDER BY "createdAt" ASC /* ${queryTag}_commissions */`),
    prisma.$queryRawUnsafe(`SELECT * FROM "DeletionRequest" ORDER BY "createdAt" ASC /* ${queryTag}_deletions */`)
  ]);

  const data = {
    metadata: {
      format: "merkur-full-backup-v1",
      createdAt: new Date().toISOString(),
      databaseProvider: "postgresql",
      warning: "Bu dosya parola özetleri ve kişisel bilgiler içerir; gizli tutulmalıdır."
    },
    counts: {
      users: users.length,
      wallets: wallets.length,
      walletTransactions: walletTransactions.length,
      lessons: lessons.length,
      settings: settings.length,
      commissions: commissions.length,
      deletionRequests: deletionRequests.length
    },
    data: { users, wallets, walletTransactions, lessons, settings, commissions, deletionRequests }
  };

  const contents = JSON.stringify(data, null, 2);
  const digest = crypto.createHash("sha256").update(contents).digest("hex");
  const backupDirectory = path.resolve(process.cwd(), "backups", "database");
  const filename = `merkur-full-${timestamp()}.json`;
  const outputPath = path.join(backupDirectory, filename);

  await fs.mkdir(backupDirectory, { recursive: true });
  await fs.writeFile(outputPath, contents, { encoding: "utf8", flag: "wx" });
  await fs.writeFile(`${outputPath}.sha256`, `${digest}  ${filename}\n`, { encoding: "utf8", flag: "wx" });

  console.log(`BACKUP_OK ${outputPath}`);
  console.log(`SHA256 ${digest}`);
  console.log(`COUNTS ${JSON.stringify(data.counts)}`);
}

main()
  .catch((error) => {
    console.error("BACKUP_FAILED", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
