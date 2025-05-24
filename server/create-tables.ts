import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

async function createTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  // Create a database connection pool
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Creating database tables...');
    
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'migrations', '0000_initial.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL statements
    await pool.query(sql);
    
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// This file is imported and executed from index.ts

export { createTables };