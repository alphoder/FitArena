import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db";
import { challenges, challengeParticipants, groups, users } from "@fitarena/db/schema";
import { eq, and, or, desc, gte, lte, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { schemas } from "@fitarena/shared/validation";

export async function challengeRoutes(app: FastifyInstance): Promise<void> {
  // Create challenge
  app.post(
    "/api/v1/challenges",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const body = schemas.challenge.create.safeParse(request.body);

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

      const {
        name,
        type,
        description,
        targetType,
        targetValue,
        activityTypeFilter,
        durationDays,
        startsAt,
        stakeAmount,
        verificationRequired,
      } = body.data;

      const startDate = new Date(startsAt);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      const [challenge] = await db
        .insert(challenges)
        .values({
          name,
          type,
          description,
          createdByUserId: userId,
          targetType,
          targetValue,
          activityTypeFilter,
          durationDays,
          startsAt: startDate,
          endsAt: endDate,
          status: startDate <= new Date() ? "active" : "pending",
          stakeAmount,
          verificationRequired: verificationRequired || (stakeAmount ? true : false),
          minConfidenceScore: stakeAmount ? "0.8" : "0.0",
        })
        .returning();

      // Auto-add creator as participant
      await db.insert(challengeParticipants).values({
        challengeId: challenge.id,
        userId,
      });

      return reply.status(201).send({
        success: true,
        data: challenge,
      });
    }
  );

  // Get challenges
  app.get(
    "/api/v1/challenges",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { status, type, cursor, limit = "20" } = request.query as {
        status?: string;
        type?: string;
        cursor?: string;
        limit?: string;
      };

      const limitNum = Math.min(parseInt(limit, 10), 50);

      // Get challenges user is participating in or public challenges
      const challengeList = await db.query.challenges.findMany({
        where: and(
          status ? eq(challenges.status, status as any) : undefined,
          type ? eq(challenges.type, type as any) : undefined
        ),
        orderBy: desc(challenges.createdAt),
        limit: limitNum + 1,
      });

      const hasMore = challengeList.length > limitNum;
      const items = hasMore ? challengeList.slice(0, -1) : challengeList;

      // Get participation status for each challenge
      const itemsWithParticipation = await Promise.all(
        items.map(async (challenge) => {
          const participation = await db.query.challengeParticipants.findFirst({
            where: and(
              eq(challengeParticipants.challengeId, challenge.id),
              eq(challengeParticipants.userId, userId)
            ),
          });

          // Get participant count
          const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(challengeParticipants)
            .where(eq(challengeParticipants.challengeId, challenge.id));

          return {
            ...challenge,
            isParticipating: !!participation,
            userProgress: participation?.progress || 0,
            participantCount: countResult?.count || 0,
          };
        })
      );

      return reply.send({
        success: true,
        data: itemsWithParticipation,
        pagination: {
          cursor: hasMore ? items[items.length - 1].id : undefined,
          hasMore,
        },
      });
    }
  );

  // Get challenge by ID
  app.get(
    "/api/v1/challenges/:id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, id),
      });

      if (!challenge) {
        return reply.status(404).send({
          success: false,
          error: { code: "CHALLENGE_NOT_FOUND", message: "Challenge not found" },
        });
      }

      // Get participants
      const participants = await db
        .select({
          id: challengeParticipants.id,
          userId: challengeParticipants.userId,
          groupId: challengeParticipants.groupId,
          progress: challengeParticipants.progress,
          targetMet: challengeParticipants.targetMet,
          displayName: users.displayName,
          profilePhotoUrl: users.profilePhotoUrl,
        })
        .from(challengeParticipants)
        .leftJoin(users, eq(challengeParticipants.userId, users.id))
        .where(eq(challengeParticipants.challengeId, id))
        .orderBy(desc(challengeParticipants.progress));

      // Check if current user is participating
      const userParticipation = participants.find((p) => p.userId === userId);

      return reply.send({
        success: true,
        data: {
          ...challenge,
          participants,
          isParticipating: !!userParticipation,
          userProgress: userParticipation?.progress || 0,
        },
      });
    }
  );

  // Join challenge
  app.post(
    "/api/v1/challenges/:id/join",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, id),
      });

      if (!challenge) {
        return reply.status(404).send({
          success: false,
          error: { code: "CHALLENGE_NOT_FOUND", message: "Challenge not found" },
        });
      }

      if (challenge.status === "completed" || challenge.status === "cancelled") {
        return reply.status(400).send({
          success: false,
          error: { code: "CHALLENGE_ENDED", message: "Challenge has ended" },
        });
      }

      // Check if already participating
      const existing = await db.query.challengeParticipants.findFirst({
        where: and(
          eq(challengeParticipants.challengeId, id),
          eq(challengeParticipants.userId, userId)
        ),
      });

      if (existing) {
        return reply.status(400).send({
          success: false,
          error: { code: "ALREADY_JOINED", message: "Already participating in this challenge" },
        });
      }

      // Add participant
      const [participation] = await db
        .insert(challengeParticipants)
        .values({
          challengeId: id,
          userId,
        })
        .returning();

      return reply.status(201).send({
        success: true,
        data: participation,
      });
    }
  );

  // Get challenge leaderboard
  app.get(
    "/api/v1/challenges/:id/leaderboard",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const participants = await db
        .select({
          rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${challengeParticipants.progress} DESC)`,
          userId: challengeParticipants.userId,
          groupId: challengeParticipants.groupId,
          progress: challengeParticipants.progress,
          targetMet: challengeParticipants.targetMet,
          displayName: users.displayName,
          profilePhotoUrl: users.profilePhotoUrl,
        })
        .from(challengeParticipants)
        .leftJoin(users, eq(challengeParticipants.userId, users.id))
        .where(eq(challengeParticipants.challengeId, id))
        .orderBy(desc(challengeParticipants.progress))
        .limit(50);

      return reply.send({
        success: true,
        data: participants,
      });
    }
  );

  // Accept versus challenge
  app.post(
    "/api/v1/challenges/:id/accept",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { id } = request.params as { id: string };

      const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, id),
      });

      if (!challenge) {
        return reply.status(404).send({
          success: false,
          error: { code: "CHALLENGE_NOT_FOUND", message: "Challenge not found" },
        });
      }

      if (challenge.type !== "versus") {
        return reply.status(400).send({
          success: false,
          error: { code: "NOT_VERSUS", message: "Only versus challenges can be accepted" },
        });
      }

      if (challenge.status !== "pending") {
        return reply.status(400).send({
          success: false,
          error: { code: "INVALID_STATUS", message: "Challenge is not pending" },
        });
      }

      // Update status to active
      await db
        .update(challenges)
        .set({ status: "active" })
        .where(eq(challenges.id, id));

      return reply.send({
        success: true,
        data: { message: "Challenge accepted" },
      });
    }
  );
}
