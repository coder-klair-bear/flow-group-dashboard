import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDb, db } from "./client.js";

async function main(): Promise<void> {
  console.log("Running migrations from ./drizzle …");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
