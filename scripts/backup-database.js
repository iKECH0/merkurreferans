const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const prisma = new PrismaClient();

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  // Discover every public table so future models are included automatically.
  // Raw SELECTs keep the backup usable immediately before Prisma schema migrations.
  const queryTag = `backup_${Date.now()}`;
  const snapshot = await prisma.$transaction(async (transaction) => {
    const tables = await transaction.$queryRawUnsafe(
      `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename /* ${queryTag}_tables */`
    );
    const snapshot = {};
    for (const { tablename } of tables) {
      const safeTableName = String(tablename).replace(/"/g, '""');
      snapshot[tablename] = await transaction.$queryRawUnsafe(
        `SELECT * FROM "${safeTableName}" /* ${queryTag}_${safeTableName} */`
      );
    }
    return snapshot;
  }, { timeout: 30000 });

  const counts = Object.fromEntries(Object.entries(snapshot).map(([table, rows]) => [table, rows.length]));

  const data = {
    metadata: {
      format: "merkur-full-backup-v1",
      createdAt: new Date().toISOString(),
      databaseProvider: "postgresql",
      warning: "Bu dosya parola özetleri ve kişisel bilgiler içerir; gizli tutulmalıdır."
    },
    counts,
    data: snapshot
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
  console.log(`COUNTS ${JSON.stringify(counts)}`);
}

main()
  .catch((error) => {
    console.error("BACKUP_FAILED", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
