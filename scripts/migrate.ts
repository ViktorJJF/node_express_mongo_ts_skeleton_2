#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:password@localhost:5432/app_db';

async function runMigration() {
  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool);

  try {
    console.log('🔄 Running database migrations...');

    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../drizzle/migrations'),
    });

    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

export default runMigration;
