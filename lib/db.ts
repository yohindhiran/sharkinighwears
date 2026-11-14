import { PrismaClient } from "@prisma/client";

if (typeof window === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("dns");
    dns.setDefaultResultOrder?.("ipv4first");
  } catch {
    // ignore
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
