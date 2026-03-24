import { pgTable, uuid, timestamp, integer, text, index } from "drizzle-orm/pg-core";
import { zones } from "./zones";

export const zoneHealthLogs = pgTable("zone_health_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  zoneId: uuid("zone_id").references(() => zones.id).notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  healthScore: integer("health_score").notNull(),
  dataFreshness: integer("data_freshness"),
  tokenHealth: integer("token_health"),
  syncSuccessRate: integer("sync_success_rate"),
  dataCompleteness: integer("data_completeness"),
  activeTokens: integer("active_tokens"),
  expiredTokens: integer("expired_tokens"),
  failedSyncs: integer("failed_syncs"),
  notes: text("notes"),
}, (table) => ({
  zoneIdx: index("idx_zhl_zone").on(table.zoneId),
  timestampIdx: index("idx_zhl_timestamp").on(table.timestamp),
}));

export type ZoneHealthLog = typeof zoneHealthLogs.$inferSelect;
export type NewZoneHealthLog = typeof zoneHealthLogs.$inferInsert;
