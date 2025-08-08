import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schemas/database/*',
  out: './drizzle/migrations',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:123456@localhost:5432/myapp',
  },
  verbose: true,
  strict: true,
});
