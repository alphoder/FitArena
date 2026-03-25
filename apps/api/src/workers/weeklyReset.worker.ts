import { Worker, type Job } from "bullmq";
import { getBullMQConnection } from "./queue";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  zones,
  groups,
  groupMembers,
  zoneWeeklyScores,
} from "@fitarena/db/schema";
import { getWeekStart, SCORE_LIMITS } from "@fitarena/shared";
import { notificationQueue, type WeeklyResetJobData } from "./queue";

export function startWeeklyResetWorker(): Worker {
  const worker = new Worker<WeeklyResetJobData>(
    "weekly-reset",
    async (job: Job<WeeklyResetJobData>) => {
      const startTime = Date.now();
      console.log(`[WeeklyReset] Starting reset (triggered by: ${job.data.triggeredBy})`);

      try {
        // Step 1: Finalize zone controllers for the ending week
        await finalizeZoneControllers();

        // Step 2: Send territory change notifications
        await sendTerritoryNotifications();

        // Step 3: Reset denormalized weekly scores
        await resetWeeklyScores();

        const duration = Date.now() - startTime;
        console.log(`[WeeklyReset] Completed in ${duration}ms`);

        return { success: true, duration };
      } catch (error) {
        console.error("[WeeklyReset] Failed:", error);
        throw error; // BullMQ will retry
      }
    },
    {
      connection: getBullMQConnection(),
      concurrency: 1, // Only one reset at a time
    }
  );

  worker.on("completed", (job) => {
    console.log(`[WeeklyReset] Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[WeeklyReset] Job ${job?.id} failed:`, error.message);
  });

  return worker;
}

/**
 * Finalize zone controllers for the ending week.
 * Determines which group controls each active zone based on total AP.
 */
async function finalizeZoneControllers(): Promise<void> {
  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Get all active zones
  const activeZones = await db.query.zones.findMany({
    where: eq(zones.isActive, true),
  });

  console.log(`[WeeklyReset] Finalizing ${activeZones.length} active zones`);

  for (const zone of activeZones) {
    // Get top scoring group in this zone for the week
    const [topScore] = await db
      .select({
        groupId: zoneWeeklyScores.groupId,
        totalAp: zoneWeeklyScores.totalAp,
      })
      .from(zoneWeeklyScores)
      .where(
        and(
          eq(zoneWeeklyScores.zoneId, zone.id),
          eq(zoneWeeklyScores.weekStart, weekStartStr)
        )
      )
      .orderBy(desc(zoneWeeklyScores.totalAp))
      .limit(1);

    if (topScore && (topScore.totalAp ?? 0) >= SCORE_LIMITS.zoneControlMinimum) {
      const previousController = zone.currentControllerGroupId;
      const newController = topScore.groupId;

      // Update zone controller
      await db
        .update(zones)
        .set({
          currentControllerGroupId: newController,
          controllerSince: previousController !== newController ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(zones.id, zone.id));

      // Mark controller in weekly scores
      await db
        .update(zoneWeeklyScores)
        .set({ isController: true, updatedAt: new Date() })
        .where(
          and(
            eq(zoneWeeklyScores.zoneId, zone.id),
            eq(zoneWeeklyScores.groupId, newController),
            eq(zoneWeeklyScores.weekStart, weekStartStr)
          )
        );

      // Update rank for all groups in zone
      const allScores = await db
        .select({ id: zoneWeeklyScores.id })
        .from(zoneWeeklyScores)
        .where(
          and(
            eq(zoneWeeklyScores.zoneId, zone.id),
            eq(zoneWeeklyScores.weekStart, weekStartStr)
          )
        )
        .orderBy(desc(zoneWeeklyScores.totalAp));

      for (let i = 0; i < allScores.length; i++) {
        await db
          .update(zoneWeeklyScores)
          .set({ rank: i + 1 })
          .where(eq(zoneWeeklyScores.id, allScores[i].id));
      }
    }
  }
}

/**
 * Queue notifications for territory changes.
 */
async function sendTerritoryNotifications(): Promise<void> {
  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Find zones where controller changed this week
  const controlledZones = await db
    .select({
      zoneId: zoneWeeklyScores.zoneId,
      groupId: zoneWeeklyScores.groupId,
      zoneName: zones.name,
      groupName: groups.name,
    })
    .from(zoneWeeklyScores)
    .innerJoin(zones, eq(zoneWeeklyScores.zoneId, zones.id))
    .innerJoin(groups, eq(zoneWeeklyScores.groupId, groups.id))
    .where(
      and(
        eq(zoneWeeklyScores.weekStart, weekStartStr),
        eq(zoneWeeklyScores.isController, true)
      )
    );

  for (const entry of controlledZones) {
    // Get group members to notify
    const members = await db
      .select({ userId: groupMembers.userId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, entry.groupId),
          eq(groupMembers.isActive, true)
        )
      );

    for (const member of members) {
      await notificationQueue.add(
        "territory-win",
        {
          type: "push" as const,
          userId: member.userId,
          title: "Territory Conquered! 🏆",
          body: `${entry.groupName} now controls ${entry.zoneName}!`,
          data: { zoneId: entry.zoneId, groupId: entry.groupId },
          priority: 1, // P1 — always send
        },
        { priority: 1 }
      );
    }
  }

  console.log(`[WeeklyReset] Queued notifications for ${controlledZones.length} zone controllers`);
}

/**
 * Reset denormalized weekly AP counters on groups and members.
 * Historical data in zoneWeeklyScores is preserved.
 */
async function resetWeeklyScores(): Promise<void> {
  // Reset groups.currentWeekAp
  await db.update(groups).set({
    currentWeekAp: 0,
    zoneRank: null,
    updatedAt: new Date(),
  });

  // Reset groupMembers.weeklyAp
  await db.update(groupMembers).set({
    weeklyAp: 0,
  });

  console.log("[WeeklyReset] Reset all group/member weekly AP counters");
}
