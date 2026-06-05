import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Délégations requises — détecte un client Prisma obsolète après `prisma generate`. */
const REQUIRED_DELEGATES = ["testimonialSubmission"] as const;

function isStaleClient(client: PrismaClient) {
  return REQUIRED_DELEGATES.some(
    (key) => !(key in client)
  );
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;

  if (cached && !isStaleClient(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect();
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
