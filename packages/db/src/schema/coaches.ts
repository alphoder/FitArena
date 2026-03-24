import { pgTable, uuid, varchar, timestamp, boolean, integer, decimal, text, index } from "drizzle-orm/pg-core";
import { gyms } from "./gyms";

export const coaches = pgTable("coaches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").unique().notNull(), // Reference added later
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  specialization: varchar("specialization", { length: 100 }),
  certification: varchar("certification", { length: 200 }),
  isCertified: boolean("is_certified").default(false),
  gymId: uuid("gym_id").references(() => gyms.id),
  clientCount: integer("client_count").default(0),
  maxClients: integer("max_clients").default(5),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at", { withTimezone: true }),
  monthlyRate: integer("monthly_rate"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_coaches_user").on(table.userId),
  gymIdx: index("idx_coaches_gym").on(table.gymId),
}));

export type Coach = typeof coaches.$inferSelect;
export type NewCoach = typeof coaches.$inferInsert;
