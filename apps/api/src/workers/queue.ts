import { Queue, Worker, type Job } from "bullmq";
import { config } from "../config";
import Redis from "ioredis";

// BullMQ needs its own Redis connection with maxRetriesPerRequest: null
// Lazy-initialized to avoid crashing if Redis is unavailable
let _connection: Redis | null = null;

export function getBullMQConnection(): Redis {
  if (!_connection && config.redisUrl) {
    _connection = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  if (!_connection) {
    throw new Error("Redis not configured for BullMQ");
  }
  return _connection;
}

function getConnection() {
  return { connection: getBullMQConnection() };
}

// ── Queues (lazy-init via getters) ─────────────────────

let _weeklyResetQueue: Queue | null = null;
let _activityProcessingQueue: Queue | null = null;
let _notificationQueue: Queue | null = null;

export function getWeeklyResetQueue() {
  if (!_weeklyResetQueue) _weeklyResetQueue = new Queue("weekly-reset", getConnection());
  return _weeklyResetQueue;
}

export function getActivityProcessingQueue() {
  if (!_activityProcessingQueue) _activityProcessingQueue = new Queue("activity-processing", getConnection());
  return _activityProcessingQueue;
}

export function getNotificationQueue() {
  if (!_notificationQueue) _notificationQueue = new Queue("notifications", getConnection());
  return _notificationQueue;
}

// Backwards-compatible exports
export const weeklyResetQueue = { add: (...args: Parameters<Queue["add"]>) => getWeeklyResetQueue().add(...args) } as Queue;
export const activityProcessingQueue = { add: (...args: Parameters<Queue["add"]>) => getActivityProcessingQueue().add(...args) } as Queue;
export const notificationQueue = { add: (...args: Parameters<Queue["add"]>) => getNotificationQueue().add(...args) } as Queue;

// ── Schedule recurring jobs ────────────────────────────

export async function scheduleRecurringJobs(): Promise<void> {
  // Weekly reset: Every Monday at 00:00 IST (Sunday 18:30 UTC)
  await weeklyResetQueue.upsertJobScheduler(
    "weekly-reset-monday",
    { pattern: "30 18 * * 0" }, // Sunday 18:30 UTC = Monday 00:00 IST
    {
      name: "weekly-reset",
      data: { triggeredBy: "scheduler" },
    }
  );

  // Weekly WhatsApp digest: Every Sunday at 18:00 IST (12:30 UTC)
  await notificationQueue.upsertJobScheduler(
    "weekly-digest-sunday",
    { pattern: "30 12 * * 0" }, // Sunday 12:30 UTC = Sunday 18:00 IST
    {
      name: "weekly-digest-trigger",
      data: {
        type: "whatsapp" as const,
        userId: "__BATCH__", // Special marker — worker will fan out to all active users
        title: "Weekly Digest",
        body: "Trigger weekly digest batch",
        priority: 4 as const,
      },
    }
  );

  // Google Fit polling: Every 5 minutes — fans out to all connected users
  await activityProcessingQueue.upsertJobScheduler(
    "google-fit-poll",
    { pattern: "*/5 * * * *" }, // Every 5 minutes
    {
      name: "google-fit-poll-trigger",
      data: {
        userId: "__GOOGLE_FIT_BATCH__",
        source: "google_fit" as const,
        sourceActivityId: "poll",
        rawData: { triggeredBy: "scheduler" },
      },
    }
  );

  console.log("  Recurring jobs scheduled (weekly reset: Monday 00:00 IST, digest: Sunday 18:00 IST, Google Fit poll: every 5 min)");
}

// ── Job types ──────────────────────────────────────────

export interface WeeklyResetJobData {
  triggeredBy: "scheduler" | "manual";
}

export interface ActivityProcessingJobData {
  userId: string;
  source: "strava" | "google_fit" | "terra";
  sourceActivityId: string;
  rawData: Record<string, unknown>;
}

export interface NotificationJobData {
  type: "push" | "whatsapp" | "in_app";
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  priority: 1 | 2 | 3 | 4; // P1=always, P2=under limit, P3=batch, P4=weekly
}
