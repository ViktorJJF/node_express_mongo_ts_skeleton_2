#!/usr/bin/env ts-node
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { getConnectionString } from '../../src/config/database';
import { users } from '../../src/schemas/database';
import * as auth from '../../src/helpers/auth';

async function main() {
  const pool = new Pool({ connectionString: getConnectionString() });
  const db = drizzle(pool);
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'bolainas@gmail.com'))
      .limit(1);
    console.log('user:', { id: user.id, email: user.email, password: user.password });
    const ok = await auth.checkPassword('123456', user as any);
    console.log('compare result:', ok);
  } catch (e) {
    console.error('compare error:', e);
  } finally {
    await pool.end();
  }
}

main();


