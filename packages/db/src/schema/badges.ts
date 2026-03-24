import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

// Badge categories
export const badgeCategories = ["consistency", "territory", "social", "performance", "seasonal", "coach"] as const;
export type BadgeCategory = (typeof badgeCategories)[number];

export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  quarter: varchar("quarter", { length: 10 }).notNull(), // Q1, Q2, Q3, Q4
  year: varchar("year", { length: 4 }).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 30 }).notNull().$type<BadgeCategory>(),
  iconUrl: text("icon_url"),
  isSeasonal: boolean("is_seasonal").default(false),
  seasonId: uuid("season_id").references(() => seasons.id),
  criteria: jsonb("criteria"), // Machine-readable unlock criteria
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;

export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  badgeId: uuid("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueBadge: uniqueIndex("idx_user_badges_unique").on(table.userId, table.badgeId),
}));

export type UserBadge = typeof userBadges.$inferSelect;
export type NewUserBadge = typeof userBadges.$inferInsert;
