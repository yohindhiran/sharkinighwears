import { PrismaClient } from "@prisma/client";

if (typeof window === "undefined") {
  try {
    // Force IPv4 first to avoid IPv6 NAT64 lookup timeouts on remote pooler
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("dns");
    dns.setDefaultResultOrder?.("ipv4first");
  } catch {
    // ignore
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Always retain singleton in global scope across all environments and hot-reloads
globalForPrisma.prisma = db;
