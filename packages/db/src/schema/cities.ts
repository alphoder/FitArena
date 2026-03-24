import { pgTable, uuid, varchar, timestamp, boolean, integer, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { states } from "./states";

export const cities = pgTable("cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  stateId: uuid("state_id").references(() => states.id),
  centerLat: decimal("center_lat", { precision: 10, scale: 7 }),
  centerLng: decimal("center_lng", { precision: 10, scale: 7 }),
  boundaryGeojson: jsonb("boundary_geojson"),
  totalActiveUsers: integer("total_active_users").default(0),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  stateIdx: index("idx_cities_state").on(table.stateId),
}));

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
