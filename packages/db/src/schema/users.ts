import { pgTable, uuid, varchar, timestamp, boolean, integer, text, date, index } from "drizzle-orm/pg-core";
import { zones } from "./zones";
import { cities } from "./cities";
import { coaches } from "./coaches";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: varchar("phone_number", { length: 15 }).unique().notNull(),
  phoneVerified: boolean("phone_verified").default(false),
  displayName: varchar("display_name", { length: 50 }),
  email: varchar("email", { length: 255 }),
  profilePhotoUrl: text("profile_photo_url"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  homePinCode: varchar("home_pin_code", { length: 6 }),
  homeZoneId: uuid("home_zone_id").references(() => zones.id),
  cityId: uuid("city_id").references(() => cities.id),
  languagePref: varchar("language_pref", { length: 5 }).default("en"),
  xpTotal: integer("xp_total").default(0),
  level: integer("level").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  streakLastActive: date("streak_last_active"),
  streakFreezeCount: integer("streak_freeze_count").default(1),
  onboardingComplete: boolean("onboarding_complete").default(false),
  stravaConnected: boolean("strava_connected").default(false),
  googleFitConnected: boolean("google_fit_connected").default(false),
  terraConnected: boolean("terra_connected").default(false),
  coachId: uuid("coach_id").references(() => coaches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
}, (table) => ({
  phoneIdx: index("idx_users_phone").on(table.phoneNumber),
  homeZoneIdx: index("idx_users_home_zone").on(table.homeZoneId),
  cityIdx: index("idx_users_city").on(table.cityId),
  coachIdx: index("idx_users_coach").on(table.coachId),
  lastActiveIdx: index("idx_users_last_active").on(table.lastActiveAt),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
