import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { requireDatabaseUrl } from "../env.js";
import * as schema from "./schema.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: requireDatabaseUrl(),
  max: 10,
});

export const db = drizzle(pool, { schema });

export type Db = typeof db;

export async function closeDb(): Promise<void> {
  await pool.end();
}
