import { pgTable, uuid, varchar, timestamp, boolean, integer, decimal, jsonb, text, index } from "drizzle-orm/pg-core";
import { zones } from "./zones";
import { cities } from "./cities";

export const gyms = pgTable("gyms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  address: text("address"),
  zoneId: uuid("zone_id").references(() => zones.id),
  cityId: uuid("city_id").references(() => cities.id),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  ownerUserId: uuid("owner_user_id"), // Reference added later
  photos: jsonb("photos").$type<string[]>(),
  operatingHours: jsonb("operating_hours"),
  phone: varchar("phone", { length: 15 }),
  website: text("website"),
  isVerified: boolean("is_verified").default(false),
  memberCount: integer("member_count").default(0),
  zoneRank: integer("zone_rank"),
  weeklyAp: integer("weekly_ap").default(0),
  qrCodeUrl: text("qr_code_url"),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  zoneIdx: index("idx_gyms_zone").on(table.zoneId),
  cityIdx: index("idx_gyms_city").on(table.cityId),
  locationIdx: index("idx_gyms_location").on(table.lat, table.lng),
}));

export type Gym = typeof gyms.$inferSelect;
export type NewGym = typeof gyms.$inferInsert;
