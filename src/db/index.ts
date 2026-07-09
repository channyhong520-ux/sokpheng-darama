import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Using the provided Neon URL directly as the primary source to avoid any env variable confusion
const databaseUrl = "postgresql://neondb_owner:npg_enEZTmDj4h0s@ep-damp-tree-atrmsk6h-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000, // Increased timeout
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
