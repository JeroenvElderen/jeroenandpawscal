// test-prisma.ts
import { PrismaClient } from "./packages/prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

const pg = new pkg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pg);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();
  console.log("✅ Prisma OK with Neon");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
