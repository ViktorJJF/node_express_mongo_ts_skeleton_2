import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import logger from './logger';
import * as schema from '../schemas/database';

let db: ReturnType<typeof drizzle>;
let pool: Pool;

export const getConnectionString = (): string => {
  return (
    process.env.DATABASE_URL ||
    'postgresql://postgres:123456@localhost:5432/myapp'
  );
};

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = parseInt(value || '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildPoolConfig = (connectionString: string): PoolConfig => {
  return {
    connectionString,
    // Pool sizing
    max: toInt(process.env.PGPOOL_MAX, 20),
    // Timeouts
    idleTimeoutMillis: toInt(process.env.PGPOOL_IDLE_MS, 30_000),
    connectionTimeoutMillis: toInt(
      process.env.PGPOOL_CONN_TIMEOUT_MS,
      30_000,
    ),
    // Query protections
    statement_timeout: toInt(process.env.PGPOOL_STATEMENT_TIMEOUT_MS, 30_000),
    query_timeout: toInt(process.env.PGPOOL_QUERY_TIMEOUT_MS, 30_000),
    // Connection recycling to avoid long-lived issues (supported by pg runtime)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    maxUses: toInt(process.env.PGPOOL_MAX_USES, 7500),
    keepAlive:
      process.env.PGPOOL_KEEPALIVE === undefined
        ? true
        : process.env.PGPOOL_KEEPALIVE === 'true',
    allowExitOnIdle: process.env.PGPOOL_ALLOW_EXIT_ON_IDLE === 'true',
    // Tag connections in pg_stat_activity (supported by pg runtime)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    application_name: process.env.PGPOOL_APP_NAME || 'node-express-api',
  };
};

export const initializeDatabase = () => {
  // Idempotent init: if already initialized, skip
  if (db && pool) {
    return db;
  }

  const connectionString = getConnectionString();

  try {
    const poolConfig = buildPoolConfig(connectionString);
    pool = new Pool(poolConfig);

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
    return db;
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
    // Reset singleton refs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db = undefined as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pool = undefined as any;
  }
};

export const isDatabaseInitialized = (): boolean => Boolean(db && pool);
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

export { schema };
export default getDatabase;
