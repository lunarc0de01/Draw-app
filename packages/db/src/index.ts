import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const prismaClientSingleton = () => {
  const pool = new pg.Pool({
    connectionString: "postgresql://postgres:ilovemia@localhost:5432/postgres?sslmode=disable",
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prismaClient = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prismaClient;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prismaClient;