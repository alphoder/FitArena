import { pgTable, uuid, varchar, timestamp, boolean, integer, decimal, text, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { groups } from "./groups";
import { coaches } from "./coaches";

// Challenge types
export const challengeTypes = ["group", "versus", "zone", "coach", "stake"] as const;
export type ChallengeType = (typeof challengeTypes)[number];

// Target types
export const targetTypes = ["ap_total", "activity_count", "streak", "distance", "custom"] as const;
export type TargetType = (typeof targetTypes)[number];

// Challenge status
export const challengeStatuses = ["pending", "active", "completed", "cancelled"] as const;
export type ChallengeStatus = (typeof challengeStatuses)[number];

export const challenges = pgTable("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().$type<ChallengeType>(),
  description: text("description"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  createdByGroupId: uuid("created_by_group_id").references(() => groups.id),
  createdByCoachId: uuid("created_by_coach_id").references(() => coaches.id),
  targetType: varchar("target_type", { length: 20 }).$type<TargetType>(),
  targetValue: integer("target_value"),
  activityTypeFilter: varchar("activity_type_filter", { length: 30 }),
  durationDays: integer("duration_days").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").$type<ChallengeStatus>(),
  stakeAmount: integer("stake_amount"), // in paise
  stakePool: integer("stake_pool").default(0),
  platformFeePct: decimal("platform_fee_pct", { precision: 4, scale: 2 }).default("15.0"),
  verificationRequired: boolean("verification_required").default(false),
  minConfidenceScore: decimal("min_confidence_score", { precision: 3, scale: 2 }).default("0.0"),
  results: jsonb("results"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusIdx: index("idx_challenges_status").on(table.status),
  datesIdx: index("idx_challenges_dates").on(table.startsAt, table.endsAt),
  typeIdx: index("idx_challenges_type").on(table.type),
}));

export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;

export const challengeParticipants = pgTable("challenge_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeId: uuid("challenge_id").references(() => challenges.id).notNull(),
  userId: uuid("user_id").references(() => users.id),
  groupId: uuid("group_id").references(() => groups.id),
  progress: integer("progress").default(0),
  targetMet: boolean("target_met").default(false),
  stakePaid: boolean("stake_paid").default(false),
  payoutAmount: integer("payout_amount").default(0),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  challengeIdx: index("idx_cp_challenge").on(table.challengeId),
  userIdx: index("idx_cp_user").on(table.userId),
  groupIdx: index("idx_cp_group").on(table.groupId),
}));

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type NewChallengeParticipant = typeof challengeParticipants.$inferInsert;
