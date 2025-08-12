import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
  serial,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  logo: text('logo'),
  website: text('website'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
  updated_at: timestamp('updated_at')
    .default(sql`now()`)
    .notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
