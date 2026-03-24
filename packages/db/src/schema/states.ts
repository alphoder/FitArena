import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const states = pgTable("states", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 5 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type State = typeof states.$inferSelect;
export type NewState = typeof states.$inferInsert;
