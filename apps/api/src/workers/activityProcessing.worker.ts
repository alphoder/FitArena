import { Worker, type Job } from "bullmq";
import { getBullMQConnection } from "./queue";
import { processStravaWebhook } from "../services/strava";
import { syncGoogleFitActivities } from "../services/googlefit";
import { notificationQueue, type ActivityProcessingJobData } from "./queue";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { oauthTokens } from "@fitarena/db/schema";

export function startActivityProcessingWorker(): Worker {
  const worker = new Worker<ActivityProcessingJobData>(
    "activity-processing",
    async (job: Job<ActivityProcessingJobData>) => {
      const { userId, source, sourceActivityId, rawData } = job.data;

      console.log(`[ActivityProcessing] Processing ${source} activity ${sourceActivityId} for user ${userId}`);

      try {
        // Handle batch polling jobs (fan out to all connected users)
        if (userId === "__GOOGLE_FIT_BATCH__") {
          const activeTokens = await db.query.oauthTokens.findMany({
            where: eq(oauthTokens.provider, "google_fit"),
          });

          const activeUsers = activeTokens.filter(t => t.tokenStatus === "ACTIVE");
          console.log(`[ActivityProcessing] Google Fit batch poll: ${activeUsers.length} connected users`);

          let totalSynced = 0;
          for (const token of activeUsers) {
            try {
              const count = await syncGoogleFitActivities(token.userId, 1); // Last 1 day
              totalSynced += count;
              if (count > 0) {
                console.log(`[ActivityProcessing] Synced ${count} Google Fit activities for user ${token.userId}`);
              }
            } catch (err) {
              console.error(`[ActivityProcessing] Google Fit sync failed for user ${token.userId}:`, err);
            }
          }

          return { success: true, source: "google_fit", totalSynced, usersPolled: activeUsers.length };
        }

        switch (source) {
          case "strava":
            await processStravaWebhook({
              object_type: "activity",
              object_id: parseInt(sourceActivityId, 10),
              aspect_type: "create",
              owner_id: parseInt(rawData.owner_id as string, 10),
              subscription_id: 0,
              event_time: Math.floor(Date.now() / 1000),
            });
            break;

          case "google_fit":
            await syncGoogleFitActivities(userId, 1);
            break;

          case "terra":
            // TODO: Terra webhook activity processing
            console.log(`[ActivityProcessing] Terra processing not yet implemented`);
            break;
        }

        // Queue notification for the user
        await notificationQueue.add(
          "activity-logged",
          {
            type: "in_app" as const,
            userId,
            title: "Activity Synced",
            body: `Your ${source} activity has been synced and Arena Points calculated!`,
            data: { source, sourceActivityId },
            priority: 3, // P3 — batch
          },
          { priority: 3 }
        );

        return { success: true, source, sourceActivityId };
      } catch (error) {
        console.error(`[ActivityProcessing] Failed for ${sourceActivityId}:`, error);
        throw error; // BullMQ will retry (default 3 attempts)
      }
    },
    {
      connection: getBullMQConnection(),
      concurrency: 5, // Process up to 5 activities in parallel
    }
  );

  worker.on("failed", (job, error) => {
    console.error(`[ActivityProcessing] Job ${job?.id} failed:`, error.message);
  });

  return worker;
}
