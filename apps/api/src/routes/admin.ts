import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { db } from "../db";
import { sql, eq, gte, and, count } from "drizzle-orm";
import { users, activities, groups, zones, oauthTokens, zoneWeeklyScores } from "@fitarena/db/schema";
import { getWeekStart } from "@fitarena/shared";
import { getRealtimeStats } from "../services/realtime";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Area-wise API monitoring dashboard
  app.get(
    "/api/v1/admin/monitoring",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // TODO: Add admin role check
      const weekStart = getWeekStart();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Parallel queries for dashboard data
      const [
        totalUsers,
        activeUsersToday,
        activeUsersWeek,
        totalGroups,
        activeZones,
        weeklyActivities,
        sourceBreakdown,
        tokenHealth,
        wsStats,
      ] = await Promise.all([
        // Total users
        db.select({ count: count() }).from(users),

        // Users active in last 24h
        db.select({ count: count() }).from(users)
          .where(gte(users.lastActiveAt, oneDayAgo)),

        // Users active in last 7 days
        db.select({ count: count() }).from(users)
          .where(gte(users.lastActiveAt, sevenDaysAgo)),

        // Total active groups
        db.select({ count: count() }).from(groups)
          .where(eq(groups.isActive, true)),

        // Active zones (with scores this week)
        db.select({ count: count() }).from(zones)
          .where(eq(zones.isActive, true)),

        // Activities this week
        db.select({ count: count() }).from(activities)
          .where(gte(activities.startedAt, weekStart)),

        // Activity source breakdown
        db.select({
          source: activities.source,
          count: count(),
        })
          .from(activities)
          .where(gte(activities.startedAt, weekStart))
          .groupBy(activities.source),

        // OAuth token health
        db.select({
          provider: oauthTokens.provider,
          status: oauthTokens.tokenStatus,
          count: count(),
        })
          .from(oauthTokens)
          .groupBy(oauthTokens.provider, oauthTokens.tokenStatus),

        // WebSocket stats
        Promise.resolve(getRealtimeStats()),
      ]);

      return reply.send({
        success: true,
        data: {
          overview: {
            totalUsers: totalUsers[0]?.count ?? 0,
            dau: activeUsersToday[0]?.count ?? 0,
            wau: activeUsersWeek[0]?.count ?? 0,
            totalGroups: totalGroups[0]?.count ?? 0,
            activeZones: activeZones[0]?.count ?? 0,
            weeklyActivities: weeklyActivities[0]?.count ?? 0,
          },
          dataIngestion: {
            sourceBreakdown: sourceBreakdown.map((s) => ({
              source: s.source,
              count: s.count,
            })),
          },
          tokenHealth: tokenHealth.map((t) => ({
            provider: t.provider,
            status: t.status,
            count: t.count,
          })),
          realtime: wsStats,
          timestamp: new Date().toISOString(),
        },
      });
    }
  );

  // Zone health overview
  app.get(
    "/api/v1/admin/zone-health",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const allZones = await db.query.zones.findMany({
        where: eq(zones.isActive, true),
      });

      const zoneHealth = allZones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        pinCode: zone.pinCode,
        healthScore: zone.zoneHealthScore ?? 0,
        healthStatus: zone.zoneHealthStatus ?? "RED",
        currentController: zone.currentControllerGroupId,
        isActive: zone.isActive,
      }));

      return reply.send({
        success: true,
        data: {
          zones: zoneHealth,
          summary: {
            total: zoneHealth.length,
            green: zoneHealth.filter((z) => (z.healthScore ?? 0) >= 80).length,
            yellow: zoneHealth.filter((z) => (z.healthScore ?? 0) >= 60 && (z.healthScore ?? 0) < 80).length,
            orange: zoneHealth.filter((z) => (z.healthScore ?? 0) >= 40 && (z.healthScore ?? 0) < 60).length,
            red: zoneHealth.filter((z) => (z.healthScore ?? 0) < 40).length,
          },
        },
      });
    }
  );
}
