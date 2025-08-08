import logger from './logger';

// MongoDB plugins no longer needed with PostgreSQL + Drizzle

export default () => {
  // MongoDB connection no longer needed - using PostgreSQL with Drizzle ORM
  logger.info(
    '📦 MongoDB config file kept for compatibility - now using PostgreSQL',
  );
};
