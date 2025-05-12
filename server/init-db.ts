import { db } from "./db";
import { storage } from "./storage";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

async function initDb() {
  try {
    console.log("Initializing database...");
    
    // Initialize all tables based on the schema
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const drizzleDb = drizzle(pool, { schema });
    
    // Create tables
    console.log("Running migrations...");
    await migrate(drizzleDb, { migrationsFolder: "./migrations" });
    console.log("Migrations completed successfully");
    
    // Seed initial data
    console.log("Seeding initial data...");
    await storage.seedInitialData();
    console.log("Database initialization completed successfully");
    
    await pool.end();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

// Run the initialization
initDb();