import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db";
import { users, activities, userBadges, badges, groupMembers, groups } from "@fitarena/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { schemas } from "@fitarena/shared/validation";
import { getWeekStart, getWeekEnd, getUserWeeklyAp } from "../services/activity";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // Get current user profile
  app.get(
    "/api/v1/users/me",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }

      // Get user badges
      const earnedBadges = await db
        .select({ badgeId: userBadges.badgeId, name: badges.name, iconUrl: badges.iconUrl })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, userId));

      return reply.send({
        success: true,
        data: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          email: user.email,
          profilePhotoUrl: user.profilePhotoUrl,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          homePinCode: user.homePinCode,
          homeZoneId: user.homeZoneId,
          cityId: user.cityId,
          languagePref: user.languagePref,
          xpTotal: user.xpTotal,
          level: user.level,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          onboardingComplete: user.onboardingComplete,
          stravaConnected: user.stravaConnected,
          googleFitConnected: user.googleFitConnected,
          badges: earnedBadges,
          createdAt: user.createdAt,
        },
      });
    }
  );

  // Update current user profile
  app.patch(
    "/api/v1/users/me",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const body = schemas.user.update.safeParse(request.body);

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

      const [updatedUser] = await db
        .update(users)
        .set({
          ...body.data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return reply.send({
        success: true,
        data: updatedUser,
      });
    }
  );

  // Get user stats
  app.get(
    "/api/v1/users/me/stats",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { period = "week" } = request.query as { period?: string };

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { currentStreak: true, longestStreak: true, xpTotal: true, level: true },
      });

      // Calculate date range
      let startDate: Date;
      let endDate = new Date();

      switch (period) {
        case "month":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "season":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "all":
          startDate = new Date(0);
          break;
        default: // week
          startDate = getWeekStart();
          endDate = getWeekEnd();
      }

      // Get activities for period
      const periodActivities = await db.query.activities.findMany({
        where: and(
          eq(activities.userId, userId),
          gte(activities.startedAt, startDate),
          lte(activities.startedAt, endDate)
        ),
      });

      const totalAp = periodActivities.reduce((sum, a) => sum + a.arenaPoints, 0);
      const activityCount = periodActivities.length;

      // Get user's primary group and rank
      const membership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.userId, userId), eq(groupMembers.isActive, true)),
        with: { group: true },
        orderBy: desc(groupMembers.joinedAt),
      });

      return reply.send({
        success: true,
        data: {
          period,
          totalAp,
          activityCount,
          currentStreak: user?.currentStreak || 0,
          longestStreak: user?.longestStreak || 0,
          xpTotal: user?.xpTotal || 0,
          level: user?.level || 1,
          groupId: membership?.groupId,
          groupName: membership?.group?.name,
          groupRank: membership?.group?.zoneRank,
          weeklyAp: period === "week" ? totalAp : await getUserWeeklyAp(userId),
        },
      });
    }
  );

  // Get user activities
  app.get(
    "/api/v1/users/me/activities",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { cursor, limit = "20", type, from, to } = request.query as {
        cursor?: string;
        limit?: string;
        type?: string;
        from?: string;
        to?: string;
      };

      const limitNum = Math.min(parseInt(limit, 10), 100);

      let query = db.query.activities.findMany({
        where: eq(activities.userId, userId),
        orderBy: desc(activities.startedAt),
        limit: limitNum + 1,
      });

      const result = await query;

      const hasMore = result.length > limitNum;
      const items = hasMore ? result.slice(0, -1) : result;
      const nextCursor = hasMore ? items[items.length - 1].id : undefined;

      return reply.send({
        success: true,
        data: items,
        pagination: {
          cursor: nextCursor,
          hasMore,
        },
      });
    }
  );

  // Get user badges
  app.get(
    "/api/v1/users/me/badges",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      const earnedBadges = await db
        .select({
          id: userBadges.id,
          badgeId: badges.id,
          name: badges.name,
          description: badges.description,
          category: badges.category,
          iconUrl: badges.iconUrl,
          earnedAt: userBadges.earnedAt,
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, userId))
        .orderBy(desc(userBadges.earnedAt));

      return reply.send({
        success: true,
        data: earnedBadges,
      });
    }
  );

  // Get public user profile
  app.get(
    "/api/v1/users/:id/profile",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
          id: true,
          displayName: true,
          profilePhotoUrl: true,
          level: true,
          xpTotal: true,
          currentStreak: true,
          longestStreak: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      }

      // Get badges
      const earnedBadges = await db
        .select({ name: badges.name, iconUrl: badges.iconUrl })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, id));

      // Get group memberships
      const memberships = await db.query.groupMembers.findMany({
        where: and(eq(groupMembers.userId, id), eq(groupMembers.isActive, true)),
        with: { group: { columns: { id: true, name: true, type: true } } },
      });

      return reply.send({
        success: true,
        data: {
          ...user,
          badges: earnedBadges,
          groups: memberships.map((m) => m.group),
        },
      });
    }
  );
}

// Helper function (duplicate from activity service to avoid circular import)
async function getUserWeeklyAp(userId: string): Promise<number> {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const result = await db.query.activities.findMany({
    where: and(
      eq(activities.userId, userId),
      gte(activities.startedAt, weekStart),
      lte(activities.startedAt, weekEnd)
    ),
  });

  return result.reduce((sum, a) => sum + a.arenaPoints, 0);
}
