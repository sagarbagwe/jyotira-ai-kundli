import "server-only";

import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = env.DATABASE_URL
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

export function requireDatabase() {
  if (!prisma) {
    throw new Error(
      "Database is not configured. Set DATABASE_URL or use DEMO_MODE for the local showcase.",
    );
  }
  return prisma;
}