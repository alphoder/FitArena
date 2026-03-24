import { pgTable, uuid, varchar, timestamp, boolean, integer, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { cities } from "./cities";
import { states } from "./states";

export const zones = pgTable("zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  pinCode: varchar("pin_code", { length: 6 }).unique().notNull(),
  zoneName: varchar("zone_name", { length: 100 }),
  cityId: uuid("city_id").references(() => cities.id),
  stateId: uuid("state_id").references(() => states.id),
  boundaryGeojson: jsonb("boundary_geojson"),
  centerLat: decimal("center_lat", { precision: 10, scale: 7 }),
  centerLng: decimal("center_lng", { precision: 10, scale: 7 }),
  isActive: boolean("is_active").default(false),
  currentControllerGroupId: uuid("current_controller_group_id"), // Reference added later to avoid circular dep
  controllerSince: timestamp("controller_since", { withTimezone: true }),
  zoneHealthScore: integer("zone_health_score").default(100),
  zoneHealthStatus: varchar("zone_health_status", { length: 10 }).default("GREEN"),
  totalActiveUsers: integer("total_active_users").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pinCodeIdx: index("idx_zones_pin_code").on(table.pinCode),
  cityIdx: index("idx_zones_city").on(table.cityId),
  activeIdx: index("idx_zones_active").on(table.isActive),
  healthIdx: index("idx_zones_health").on(table.zoneHealthStatus),
}));

export type Zone = typeof zones.$inferSelect;
export type NewZone = typeof zones.$inferInsert;
