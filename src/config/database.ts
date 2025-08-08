import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import logger from './logger';
import * as schema from '../schemas/database';

let db: ReturnType<typeof drizzle>;
let pool: Pool;

export const initializeDatabase = () => {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:123456@localhost:5432/myapp';

  try {
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      logger.error(`❌ PostgreSQL pool error: ${err}`);
    });

    pool.on('connect', () => {
      logger.info('🗄️ PostgreSQL connected successfully');
    });

    db = drizzle(pool, { schema });

    // Test the connection
    testConnection();
  } catch (err) {
    logger.error(`❌ Database connection failed: ${err}`);
    throw err;
  }
};

const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    logger.info('🗄️ PostgreSQL connection test successful');
  } catch (err) {
    logger.error(`❌ PostgreSQL connection test failed: ${err}`);
    throw err;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error(
      'Database not initialized. Call initializeDatabase() first.',
    );
  }
  return db;
};

export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    logger.info('🔌 PostgreSQL connection closed');
  }
};

export { schema };
export default getDatabase;
