import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  integer,
  text,
  serial,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstname: varchar('first_name', { length: 255 }).notNull(),
  lastname: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', {
    length: 50,
    enum: ['user', 'admin', 'superadmin', 'developer', 'agent', 'owner'],
  })
    .default('user')
    .notNull(),
  verification: varchar('verification', { length: 255 }),
  verified: boolean('verified').default(false).notNull(),
  phone: varchar('phone', { length: 50 }),
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 255 }),
  url_twitter: text('url_twitter'),
  url_github: text('url_github'),
  login_attempts: integer('login_attempts').default(0).notNull(),
  block_expires: timestamp('block_expires').default(sql`now()`),
  status: boolean('status').default(true).notNull(),
  created_at: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
  updated_at: timestamp('updated_at')
    .default(sql`now()`)
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
