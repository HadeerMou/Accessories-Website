import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString: env.databaseUrl,
  max: 5,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

export const prisma = new PrismaClient({ adapter });
