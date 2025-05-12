import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "../shared/schema";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// This script runs the migrations
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migrations completed successfully");

  await pool.end();
}

main().catch((e) => {
  console.error("Migration failed:");
  console.error(e);
  process.exit(1);
});