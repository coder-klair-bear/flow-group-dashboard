import { config } from "dotenv";
import { resolve } from "node:path";

/**
 * The repository root .env wins; a server/.env is read as a fallback.
 * dotenv never overwrites a variable that is already set, so the order matters.
 */
config({ path: resolve(process.cwd(), "../.env") });
config();

export const DATABASE_URL = process.env.DATABASE_URL ?? "";
export const PORT = Number(process.env.PORT ?? 4000);
export const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:5173";
export const SEED_SALT = process.env.SEED_SALT ?? "flow-group-stage-2";
export const SEED_DAYS = Number(process.env.SEED_DAYS ?? 120);
export const NODE_ENV = process.env.NODE_ENV ?? "development";

export function requireDatabaseUrl(): string {
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env at the repository root and point it at a PostgreSQL database.",
    );
  }
  return DATABASE_URL;
}
