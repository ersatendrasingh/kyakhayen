import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function ensureVercelMysqlSsl() {
  if (!process.env.VERCEL || !process.env.DATABASE_URL) return;

  try {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    if (!databaseUrl.protocol.startsWith("mysql")) return;
    if (
      databaseUrl.searchParams.has("sslaccept") ||
      databaseUrl.searchParams.has("sslcert") ||
      databaseUrl.searchParams.has("sslidentity")
    ) {
      return;
    }

    databaseUrl.searchParams.set("sslaccept", "strict");
    process.env.DATABASE_URL = databaseUrl.toString();
  } catch {
    // Let Prisma surface the original DATABASE_URL error.
  }
}

ensureVercelMysqlSsl();

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
