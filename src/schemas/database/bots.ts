import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
  serial,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const bots = pgTable('bots', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: boolean('status').default(true).notNull(),
  created_at: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
  updated_at: timestamp('updated_at')
    .default(sql`now()`)
    .notNull(),
});

export type Bot = typeof bots.$inferSelect;
export type NewBot = typeof bots.$inferInsert;
