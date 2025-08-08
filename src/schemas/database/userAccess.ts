import { pgTable, varchar, timestamp, text, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userAccess = pgTable('user_access', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  ip: text('ip').notNull(),
  browser: text('browser').notNull(),
  country: text('country').notNull(),
  createdAt: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`now()`)
    .notNull(),
});

export type UserAccess = typeof userAccess.$inferSelect;
export type NewUserAccess = typeof userAccess.$inferInsert;
