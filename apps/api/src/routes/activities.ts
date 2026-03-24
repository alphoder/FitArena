import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db";
import { activities } from "@fitarena/db/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { schemas } from "@fitarena/shared/validation";
import { createActivity } from "../services/activity";
import type { ActivityType } from "@fitarena/shared";

export async function activityRoutes(app: FastifyInstance): Promise<void> {
  // Create manual activity
  app.post(
    "/api/v1/activities",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const body = schemas.activity.create.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: body.error.flatten(),
          },
        });
      }

      const { activityType, durationSeconds, distanceMeters, calories, startedAt } = body.data;

      // Check daily manual entry limit (max 3 per day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayManualEntries = await db.query.activities.findMany({
        where: and(
          eq(activities.userId, userId),
          eq(activities.source, "manual"),
          // Note: Drizzle doesn't have direct date comparison helpers
          // In production, use proper date filtering
        ),
      });

      // Filter in JS for simplicity (in production, do this in SQL)
      const todayCount = todayManualEntries.filter((a) => {
        const aDate = new Date(a.createdAt);
        return aDate >= today && aDate < tomorrow;
      }).length;

      if (todayCount >= 3) {
        return reply.status(429).send({
          success: false,
          error: {
            code: "DAILY_LIMIT_REACHED",
            message: "Maximum 3 manual entries per day",
          },
        });
      }

      const activity = await createActivity({
        userId,
        source: "manual",
        activityType: activityType as ActivityType,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        durationSeconds,
        distanceMeters,
        calories,
        hasGps: false,
      });

      return reply.status(201).send({
        success: true,
        data: activity,
      });
    }
  );

  // Get activity by ID
  app.get(
    "/api/v1/activities/:id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const activity = await db.query.activities.findFirst({
        where: eq(activities.id, id),
      });

      if (!activity) {
        return reply.status(404).send({
          success: false,
          error: { code: "ACTIVITY_NOT_FOUND", message: "Activity not found" },
        });
      }

      // Only owner can see full details
      if (activity.userId !== userId) {
        // Return limited info for other users
        return reply.send({
          success: true,
          data: {
            id: activity.id,
            activityType: activity.activityType,
            durationSeconds: activity.durationSeconds,
            arenaPoints: activity.arenaPoints,
            startedAt: activity.startedAt,
          },
        });
      }

      return reply.send({
        success: true,
        data: activity,
      });
    }
  );

  // Delete activity (manual only)
  app.delete(
    "/api/v1/activities/:id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const activity = await db.query.activities.findFirst({
        where: eq(activities.id, id),
      });

      if (!activity) {
        return reply.status(404).send({
          success: false,
          error: { code: "ACTIVITY_NOT_FOUND", message: "Activity not found" },
        });
      }

      if (activity.userId !== userId) {
        return reply.status(403).send({
          success: false,
          error: { code: "FORBIDDEN", message: "Cannot delete another user's activity" },
        });
      }

      if (activity.source !== "manual") {
        return reply.status(400).send({
          success: false,
          error: {
            code: "CANNOT_DELETE",
            message: "Only manual entries can be deleted",
          },
        });
      }

      await db.delete(activities).where(eq(activities.id, id));

      // Note: In production, also update group/zone scores
      // This is simplified for MVP

      return reply.send({
        success: true,
        data: { message: "Activity deleted successfully" },
      });
    }
  );

  // Flag activity (report suspicious activity)
  app.post(
    "/api/v1/activities/:id/flag",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason?: string };

      const activity = await db.query.activities.findFirst({
        where: eq(activities.id, id),
      });

      if (!activity) {
        return reply.status(404).send({
          success: false,
          error: { code: "ACTIVITY_NOT_FOUND", message: "Activity not found" },
        });
      }

      // Can't flag own activities
      if (activity.userId === userId) {
        return reply.status(400).send({
          success: false,
          error: { code: "CANNOT_FLAG_OWN", message: "Cannot flag your own activity" },
        });
      }

      await db
        .update(activities)
        .set({
          isFlagged: true,
          flagReason: reason || "Flagged by user",
        })
        .where(eq(activities.id, id));

      return reply.send({
        success: true,
        data: { flagged: true },
      });
    }
  );
}
