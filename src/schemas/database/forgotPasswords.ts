import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
  serial,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const forgotPasswords = pgTable('forgot_passwords', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  verification: varchar('verification', { length: 255 }),
  used: boolean('used').default(false).notNull(),
  ipRequest: text('ip_request'),
  browserRequest: text('browser_request'),
  countryRequest: text('country_request'),
  ipChanged: text('ip_changed'),
  browserChanged: text('browser_changed'),
  countryChanged: text('country_changed'),
  createdAt: timestamp('created_at')
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp('updated_at')
    .default(sql`now()`)
    .notNull(),
});

export type ForgotPassword = typeof forgotPasswords.$inferSelect;
export type NewForgotPassword = typeof forgotPasswords.$inferInsert;
