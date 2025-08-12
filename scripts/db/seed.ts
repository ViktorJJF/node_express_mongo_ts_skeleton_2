#!/usr/bin/env ts-node
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { getConnectionString } from '../../src/config/database';

import * as schema from '../../src/schemas/database';

const DEFAULT_USER_EMAIL = 'bolainas@gmail.com';
const DEFAULT_USER_PASSWORD = '123456';
const DEFAULT_BOT_NAME = 'Default Bot';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(5);
  return bcrypt.hash(password, salt);
}

async function seed() {
  const connectionString = getConnectionString();

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    console.log('🌱 Seeding database...');

    // Seed default user
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, DEFAULT_USER_EMAIL))
      .limit(1);

    if (existingUsers.length === 0) {
      const passwordHash = await hashPassword(DEFAULT_USER_PASSWORD);
      await db.insert(schema.users).values({
        firstName: 'Bola',
        lastName: 'Inas',
        email: DEFAULT_USER_EMAIL,
        password: passwordHash,
        verified: true,
      });
      console.log(`✅ User created: ${DEFAULT_USER_EMAIL}`);
    } else {
      console.log(`ℹ️ User already exists: ${DEFAULT_USER_EMAIL}`);
    }

    // Seed default bot
    const existingBots = await db
      .select()
      .from(schema.bots)
      .where(eq(schema.bots.name, DEFAULT_BOT_NAME))
      .limit(1);

    if (existingBots.length === 0) {
      await db.insert(schema.bots).values({
        name: DEFAULT_BOT_NAME,
        description: 'Initial seed bot',
        is_active: true,
      });
      console.log(`✅ Bot created: ${DEFAULT_BOT_NAME}`);
    } else {
      console.log(`ℹ️ Bot already exists: ${DEFAULT_BOT_NAME}`);
    }

    console.log('🌱 Seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

export default seed;
