import { pgTable, uuid, varchar, timestamp, boolean, integer, text, index, uniqueIndex } from "drizzle-orm/pg-core";
import { zones } from "./zones";
import { gyms } from "./gyms";
import { coaches } from "./coaches";
import { users } from "./users";

// Group types: open, invite, gym, club, coach
export const groupTypes = ["open", "invite", "gym", "club", "coach"] as const;
export type GroupType = (typeof groupTypes)[number];

// Privacy types: public, unlisted, private
export const privacyTypes = ["public", "unlisted", "private"] as const;
export type PrivacyType = (typeof privacyTypes)[number];

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().$type<GroupType>(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // hex color
  motto: varchar("motto", { length: 200 }),
  homeZoneId: uuid("home_zone_id").references(() => zones.id).notNull(),
  gymId: uuid("gym_id").references(() => gyms.id),
  clubId: uuid("club_id"), // Future: reference to clubs table
  coachId: uuid("coach_id").references(() => coaches.id),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  memberCount: integer("member_count").default(0),
  maxMembers: integer("max_members").default(50),
  isActive: boolean("is_active").default(true),
  privacy: varchar("privacy", { length: 10 }).default("public").$type<PrivacyType>(),
  competitionRating: integer("competition_rating").default(1000), // Elo-like
  seasonalPoints: integer("seasonal_points").default(0),
  inviteCode: varchar("invite_code", { length: 20 }).unique(),
  currentWeekAp: integer("current_week_ap").default(0),
  zoneRank: integer("zone_rank"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  homeZoneIdx: index("idx_groups_home_zone").on(table.homeZoneId),
  typeIdx: index("idx_groups_type").on(table.type),
  gymIdx: index("idx_groups_gym").on(table.gymId),
  coachIdx: index("idx_groups_coach").on(table.coachId),
  inviteIdx: index("idx_groups_invite").on(table.inviteCode),
}));

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

// Group member roles
export const memberRoles = ["owner", "admin", "member", "observer"] as const;
export type MemberRole = (typeof memberRoles)[number];

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => groups.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 10 }).default("member").$type<MemberRole>(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  isActive: boolean("is_active").default(true),
  weeklyAp: integer("weekly_ap").default(0),
}, (table) => ({
  groupIdx: index("idx_gm_group").on(table.groupId),
  userIdx: index("idx_gm_user").on(table.userId),
  activeIdx: index("idx_gm_active").on(table.groupId, table.isActive),
  uniqueMember: uniqueIndex("idx_gm_unique").on(table.groupId, table.userId),
}));

export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
