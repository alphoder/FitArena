import { scheduleRecurringJobs } from "./queue";
import { startWeeklyResetWorker } from "./weeklyReset.worker";
import { startActivityProcessingWorker } from "./activityProcessing.worker";
import { startNotificationWorker } from "./notification.worker";
import { config } from "../config";

/**
 * Start all BullMQ workers and schedule recurring jobs.
 * Call this from the main server entry point after DB/Redis are ready.
 * Non-fatal: if Redis is unavailable, server continues without workers.
 */
export async function startWorkers(): Promise<void> {
  if (!config.redisUrl) {
    console.log("  ⚠️  Redis not configured — BullMQ workers disabled");
    return;
  }

  try {
    console.log("  Starting BullMQ workers...");

    startWeeklyResetWorker();
    startActivityProcessingWorker();
    startNotificationWorker();

    await scheduleRecurringJobs();

    console.log("  ✅ All workers started");
  } catch (error) {
    console.warn("  ⚠️  BullMQ workers failed to start (Redis may be unavailable):", (error as Error).message);
    console.warn("  Server will continue without background workers.");
  }
}

// Re-export queues for use in routes/services
export { weeklyResetQueue, activityProcessingQueue, notificationQueue } from "./queue";
export type { WeeklyResetJobData, ActivityProcessingJobData, NotificationJobData } from "./queue";
