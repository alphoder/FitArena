import { pgTable, uuid, varchar, timestamp, text, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { zones } from "./zones";

// Token status
export const tokenStatuses = ["ACTIVE", "EXPIRING", "REFRESH_FAILED", "REVOKED", "EXPIRED"] as const;
export type TokenStatus = (typeof tokenStatuses)[number];

// OAuth providers
export const oauthProviders = ["strava", "google_fit", "terra"] as const;
export type OAuthProvider = (typeof oauthProviders)[number];

export const oauthTokens = pgTable("oauth_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  provider: varchar("provider", { length: 20 }).notNull().$type<OAuthProvider>(),
  accessToken: text("access_token").notNull(), // Should be encrypted
  refreshToken: text("refresh_token"), // Should be encrypted
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  tokenStatus: varchar("token_status", { length: 20 }).default("ACTIVE").$type<TokenStatus>(),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastRefreshAt: timestamp("last_refresh_at", { withTimezone: true }),
  errorCount: integer("error_count").default(0),
  zoneId: uuid("zone_id").references(() => zones.id), // For zone-level monitoring
  athleteId: varchar("athlete_id", { length: 50 }), // Strava athlete ID
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_tokens_user").on(table.userId),
  providerIdx: index("idx_tokens_provider").on(table.provider),
  statusIdx: index("idx_tokens_status").on(table.tokenStatus),
  zoneIdx: index("idx_tokens_zone").on(table.zoneId),
  expiresIdx: index("idx_tokens_expires").on(table.expiresAt),
  uniqueProvider: uniqueIndex("idx_tokens_unique").on(table.userId, table.provider),
}));

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type NewOAuthToken = typeof oauthTokens.$inferInsert;
