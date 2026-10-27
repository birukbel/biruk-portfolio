import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** key/value JSON: "profile", "flags", "theme". */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value_json").notNull(),
});

/**
 * One table for every list on the site (experience, projects, skills ...).
 * `kind` + `data` (validated by zod, see src/lib/kinds.ts) keeps the schema small
 * and means a new section never needs a migration.
 */
export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    data: jsonb("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("items_kind_sort_idx").on(t.kind, t.sortOrder)],
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  body: text("body").notNull(),
  seen: boolean("seen").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    ip: text("ip").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_ip_idx").on(t.ip, t.createdAt)],
);

export const rateLimitHits = pgTable(
  "rate_limit_hits",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    ip: text("ip").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("rate_limit_hits_idx").on(t.key, t.ip, t.createdAt)],
);
