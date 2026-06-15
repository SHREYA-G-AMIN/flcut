// FLCUT-AI-2627-visible
import { pgTable, uuid, text, timestamp, integer, varchar, boolean } from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  longUrl: text("long_url").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  goLiveAt: timestamp("go_live_at"),
  expiresAt: timestamp("expires_at"),
  clickLimit: integer("click_limit"),
  fallbackUrl: text("fallback_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id").references(() => links.id, { onDelete: "cascade" }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  visitorHash: varchar("visitor_hash", { length: 64 }).notNull(),
  referrer: varchar("referrer", { length: 255 }).default("Direct"),
createdAt: timestamp("created_at").defaultNow().notNull(),
});