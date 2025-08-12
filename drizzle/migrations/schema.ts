import { pgTable, serial, varchar, text, boolean, timestamp, unique, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const bots = pgTable("bots", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const brands = pgTable("brands", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	logo: text(),
	website: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const forgotPasswords = pgTable("forgot_passwords", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	verification: varchar({ length: 255 }),
	used: boolean().default(false).notNull(),
	ipRequest: text("ip_request"),
	browserRequest: text("browser_request"),
	countryRequest: text("country_request"),
	ipChanged: text("ip_changed"),
	browserChanged: text("browser_changed"),
	countryChanged: text("country_changed"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('user').notNull(),
	verification: varchar({ length: 255 }),
	verified: boolean().default(false).notNull(),
	phone: varchar({ length: 50 }),
	city: varchar({ length: 255 }),
	country: varchar({ length: 255 }),
	urlTwitter: text("url_twitter"),
	urlGithub: text("url_github"),
	loginAttempts: integer("login_attempts").default(0).notNull(),
	blockExpires: timestamp("block_expires", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const userAccess = pgTable("user_access", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	ip: text().notNull(),
	browser: text().notNull(),
	country: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
