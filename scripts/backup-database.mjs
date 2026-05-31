import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const reason = (process.argv[2] || "manual").replace(/[^a-z0-9_-]/gi, "-");
const databaseUrl = process.env.DATABASE_URL;
const backupDir =
  process.env.DB_BACKUP_DIR || path.join(process.cwd(), ".backups", "mysql");
const retentionDays = Number(process.env.DB_BACKUP_RETENTION_DAYS || 30);
const s3Bucket = process.env.DB_BACKUP_S3_BUCKET;
const s3Prefix = (process.env.DB_BACKUP_S3_PREFIX || "kyakhayen/mysql")
  .replace(/^\/+|\/+$/g, "");
const requireS3Backup = process.env.DB_BACKUP_S3_REQUIRED === "true";

function fail(message) {
  console.error(`[db-backup] ${message}`);
  process.exit(1);
}

function parseDatabaseUrl(value) {
  if (!value) fail("DATABASE_URL is missing");

  const parsed = new URL(value);
  if (!["mysql:", "mysql2:"].includes(parsed.protocol)) {
    fail(`Unsupported DATABASE_URL protocol: ${parsed.protocol}`);
  }

  const database = parsed.pathname.replace(/^\/+/, "");
  if (!database) fail("DATABASE_URL database name is missing");

  return {
    host: parsed.hostname,
    port: parsed.port || "3306",
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(database),
  };
}

function removeOldLocalBackups() {
  if (!Number.isFinite(retentionDays) || retentionDays <= 0) return;
  if (!fs.existsSync(backupDir)) return;

  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  for (const file of fs.readdirSync(backupDir)) {
    if (!file.startsWith("kyakhayen-") || !file.endsWith(".sql.gz")) continue;

    const filePath = path.join(backupDir, file);
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(filePath);
      console.log(`[db-backup] Removed old backup ${filePath}`);
    }
  }
}

async function createBackup() {
  const config = parseDatabaseUrl(databaseUrl);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `kyakhayen-${reason}-${timestamp}.sql.gz`;
  const filePath = path.join(backupDir, fileName);

  fs.mkdirSync(backupDir, { recursive: true });

  const dumpArgs = [
    "--single-transaction",
    "--quick",
    "--routines",
    "--triggers",
    "--events",
    "--no-tablespaces",
    "--set-gtid-purged=OFF",
    "--default-character-set=utf8mb4",
    `--host=${config.host}`,
    `--port=${config.port}`,
    `--user=${config.user}`,
    config.database,
  ];

  console.log(`[db-backup] Creating ${filePath}`);

  await new Promise((resolve, reject) => {
    const dump = spawn("mysqldump", dumpArgs, {
      env: { ...process.env, MYSQL_PWD: config.password },
      stdio: ["ignore", "pipe", "inherit"],
    });
    const gzip = spawn("gzip", ["-c"], { stdio: ["pipe", "pipe", "inherit"] });
    const output = fs.createWriteStream(filePath, { flags: "wx" });

    dump.stdout.pipe(gzip.stdin);
    gzip.stdout.pipe(output);

    let dumpCode = null;
    let gzipCode = null;
    let outputDone = false;

    const cleanup = () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    };

    const maybeDone = () => {
      if (dumpCode === null || gzipCode === null || !outputDone) return;
      if (dumpCode === 0 && gzipCode === 0) {
        resolve();
        return;
      }

      cleanup();
      reject(new Error(`mysqldump/gzip failed: ${dumpCode}/${gzipCode}`));
    };

    dump.on("error", (error) => {
      cleanup();
      reject(error);
    });
    gzip.on("error", (error) => {
      cleanup();
      reject(error);
    });
    output.on("error", (error) => {
      cleanup();
      reject(error);
    });

    dump.on("exit", (code) => {
      dumpCode = code;
      if (code !== 0) gzip.stdin.destroy();
      maybeDone();
    });
    gzip.on("exit", (code) => {
      gzipCode = code;
      maybeDone();
    });
    output.on("close", () => {
      outputDone = true;
      maybeDone();
    });
  });

  const sizeMb = fs.statSync(filePath).size / 1024 / 1024;
  console.log(`[db-backup] Local backup complete (${sizeMb.toFixed(2)} MB)`);

  if (s3Bucket) {
    const key = `${s3Prefix}/${fileName}`;
    const destination = `s3://${s3Bucket}/${key}`;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
      fail("AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required for S3 backups");
    }

    console.log(`[db-backup] Uploading to ${destination}`);
    const client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: key,
          Body: fs.createReadStream(filePath),
          ContentType: "application/gzip",
        }),
      );
      console.log("[db-backup] S3 upload complete");
    } catch (error) {
      if (requireS3Backup) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[db-backup] S3 upload skipped: ${message}`);
      console.warn("[db-backup] Local backup was kept successfully.");
    }
  }

  removeOldLocalBackups();
}

createBackup().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
