import { pgTable, uuid, timestamp, boolean, integer, date, index, uniqueIndex } from "drizzle-orm/pg-core";
import { zones } from "./zones";
import { groups } from "./groups";

export const zoneWeeklyScores = pgTable("zone_weekly_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  zoneId: uuid("zone_id").references(() => zones.id).notNull(),
  groupId: uuid("group_id").references(() => groups.id).notNull(),
  weekStart: date("week_start").notNull(),
  totalAp: integer("total_ap").default(0),
  activeMembers: integer("active_members").default(0),
  rank: integer("rank"),
  isController: boolean("is_controller").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  zoneWeekIdx: index("idx_zws_zone_week").on(table.zoneId, table.weekStart),
  groupIdx: index("idx_zws_group").on(table.groupId),
  uniqueEntry: uniqueIndex("idx_zws_unique").on(table.zoneId, table.groupId, table.weekStart),
}));

export type ZoneWeeklyScore = typeof zoneWeeklyScores.$inferSelect;
export type NewZoneWeeklyScore = typeof zoneWeeklyScores.$inferInsert;
