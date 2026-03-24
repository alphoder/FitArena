import { pgTable, uuid, varchar, timestamp, text, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Notification channels
export const notificationChannels = ["push", "whatsapp", "email", "in_app"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

// Notification types
export const notificationTypes = [
  "territory_change",
  "rival_alert",
  "close_contest",
  "activity_logged",
  "personal_record",
  "badge_earned",
  "challenge_update",
  "coach_message",
  "group_invite",
  "weekly_digest",
  "streak_warning",
  "general",
] as const;
export type NotificationType = (typeof notificationTypes)[number];

// Notification status
export const notificationStatuses = ["pending", "sent", "delivered", "read", "failed"] as const;
export type NotificationStatus = (typeof notificationStatuses)[number];

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 30 }).notNull().$type<NotificationType>(),
  channel: varchar("channel", { length: 20 }).notNull().$type<NotificationChannel>(),
  title: varchar("title", { length: 200 }),
  body: text("body"),
  data: jsonb("data"),
  status: varchar("status", { length: 20 }).default("pending").$type<NotificationStatus>(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_notifications_user").on(table.userId),
  statusIdx: index("idx_notifications_status").on(table.status),
  scheduledIdx: index("idx_notifications_scheduled").on(table.scheduledFor),
}));

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// WhatsApp message tracking
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  groupId: uuid("group_id"),
  templateName: varchar("template_name", { length: 100 }).notNull(),
  variables: jsonb("variables"),
  phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  waMessageId: varchar("wa_message_id", { length: 100 }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_wa_user").on(table.userId),
  statusIdx: index("idx_wa_status").on(table.status),
}));

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect;
export type NewWhatsAppMessage = typeof whatsappMessages.$inferInsert;
