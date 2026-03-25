import { Worker, type Job } from "bullmq";
import { getBullMQConnection } from "./queue";
import { getRedis } from "../redis";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "@fitarena/db/schema";
import type { NotificationJobData } from "./queue";

// Daily notification limits per PRD
const DAILY_LIMITS = {
  push: 3,
  whatsapp: 1,
  in_app: 10,
};

export function startNotificationWorker(): Worker {
  const worker = new Worker<NotificationJobData>(
    "notifications",
    async (job: Job<NotificationJobData>) => {
      const { type, userId, title, body, data, priority } = job.data;

      // Check quiet hours (10PM-7AM IST)
      const now = new Date();
      const istHour = (now.getUTCHours() + 5.5) % 24;
      const isQuietHours = istHour >= 22 || istHour < 7;

      if (isQuietHours && priority > 1) {
        // Defer non-P1 notifications until 7AM IST
        console.log(`[Notification] Deferred ${type} for ${userId} (quiet hours)`);
        return { deferred: true };
      }

      // Check daily limit
      const redis = getRedis();
      const dateKey = now.toISOString().split("T")[0];
      const limitKey = `notif:${userId}:${type}:${dateKey}`;
      const count = await redis.incr(limitKey);

      if (count === 1) {
        await redis.expire(limitKey, 86400); // Expire after 24h
      }

      const limit = DAILY_LIMITS[type];
      if (count > limit && priority > 1) {
        console.log(`[Notification] Skipped ${type} for ${userId} (limit ${count}/${limit})`);
        return { skipped: true, reason: "daily_limit" };
      }

      // Send based on type
      switch (type) {
        case "push":
          await sendPushNotification(userId, title, body, data);
          break;
        case "whatsapp":
          await sendWhatsAppMessage(userId, title, body);
          break;
        case "in_app":
          await storeInAppNotification(userId, title, body, data);
          break;
      }

      return { sent: true, type };
    },
    {
      connection: getBullMQConnection(),
      concurrency: 10, // Process multiple notifications in parallel
    }
  );

  worker.on("failed", (job, error) => {
    console.error(`[Notification] Job ${job?.id} failed:`, error.message);
  });

  return worker;
}

/**
 * Send push notification via FCM.
 * TODO: Integrate with Firebase Admin SDK.
 */
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  // Get user's FCM token (would be stored in users table or separate tokens table)
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return;

  // TODO: Firebase Admin SDK integration
  // For now, log the notification
  console.log(`[Push] → ${user.displayName ?? userId}: ${title} — ${body}`);
}

/**
 * Send WhatsApp message via Business API.
 * TODO: Integrate with Interakt/AiSensy.
 */
async function sendWhatsAppMessage(
  userId: string,
  title: string,
  body: string
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.phoneNumber) return;

  // TODO: WhatsApp Business API integration
  console.log(`[WhatsApp] → ${user.phoneNumber}: ${title} — ${body}`);
}

/**
 * Store in-app notification in the database.
 */
async function storeInAppNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  // TODO: Insert into notifications table
  console.log(`[InApp] → ${userId}: ${title} — ${body}`);
}
