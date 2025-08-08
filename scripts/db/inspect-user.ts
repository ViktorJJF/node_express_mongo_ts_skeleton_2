#!/usr/bin/env ts-node
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { getConnectionString } from '../../src/config/database';
import { users } from '../../src/schemas/database';

async function main() {
  const pool = new Pool({ connectionString: getConnectionString() });
  const db = drizzle(pool);
  try {
    const result = await db
      .select({ id: users.id, email: users.email, password: users.password })
      .from(users)
      .where(eq(users.email, 'bolainas@gmail.com'))
      .limit(1);
    console.log(result[0] || null);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


