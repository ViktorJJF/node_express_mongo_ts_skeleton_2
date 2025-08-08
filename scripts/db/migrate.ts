#!/usr/bin/env ts-node
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { getConnectionString } from '../../src/config/database';

// Load environment variables
dotenv.config();

async function runMigration() {
  const pool = new Pool({
    connectionString: getConnectionString(),
  });

  const db = drizzle(pool);

  try {
    console.log('🔄 Running database migrations...');

    await migrate(db, {
      migrationsFolder: path.join(__dirname, '../../drizzle/migrations'),
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


