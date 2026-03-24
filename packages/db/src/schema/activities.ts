import { pgTable, uuid, varchar, timestamp, boolean, integer, decimal, text, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { zones } from "./zones";

// Activity sources
export const activitySources = ["strava", "google_fit", "terra", "manual"] as const;
export type ActivitySource = (typeof activitySources)[number];

// Activity types with AP multipliers (per minute)
export const activityTypes = {
  running_outdoor: 2.0,
  running_treadmill: 1.5,
  cycling_outdoor: 1.5,
  cycling_indoor: 1.2,
  swimming: 2.2,
  gym: 1.3,
  walking: 0.8,
  yoga: 1.0,
  sports: 1.5,
  hiit: 2.0,
  dance: 1.2,
  home_workout: 1.0,
  other: 0.8,
} as const;

export type ActivityType = keyof typeof activityTypes;

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  source: varchar("source", { length: 20 }).notNull().$type<ActivitySource>(),
  sourceActivityId: varchar("source_activity_id", { length: 100 }),
  activityType: varchar("activity_type", { length: 30 }).notNull().$type<ActivityType>(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  distanceMeters: integer("distance_meters"),
  calories: integer("calories"),
  avgHeartRate: integer("avg_heart_rate"),
  maxHeartRate: integer("max_heart_rate"),
  heartRateZones: jsonb("heart_rate_zones").$type<Record<string, number>>(),
  hasGps: boolean("has_gps").default(false),
  routePolyline: text("route_polyline"),
  startLat: decimal("start_lat", { precision: 10, scale: 7 }),
  startLng: decimal("start_lng", { precision: 10, scale: 7 }),
  zoneId: uuid("zone_id").references(() => zones.id),
  arenaPoints: integer("arena_points").notNull().default(0),
  baseAp: integer("base_ap").notNull().default(0),
  intensityBonus: integer("intensity_bonus").default(0),
  consistencyBonus: integer("consistency_bonus").default(0),
  verificationMult: decimal("verification_mult", { precision: 3, scale: 2 }).default("1.0"),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).default("1.0"),
  isFlagged: boolean("is_flagged").default(false),
  flagReason: varchar("flag_reason", { length: 200 }),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
}, (table) => ({
  userIdx: index("idx_activities_user").on(table.userId),
  zoneIdx: index("idx_activities_zone").on(table.zoneId),
  startedIdx: index("idx_activities_started").on(table.startedAt),
  userWeekIdx: index("idx_activities_user_week").on(table.userId, table.startedAt),
  sourceIdx: index("idx_activities_source").on(table.source, table.sourceActivityId),
  uniqueSource: uniqueIndex("idx_activities_unique_source").on(table.userId, table.source, table.sourceActivityId),
}));

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
