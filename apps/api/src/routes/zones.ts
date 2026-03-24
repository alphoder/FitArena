import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db";
import { zones, groups, zoneWeeklyScores } from "@fitarena/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { getZoneLeaderboard, isCloseContest, getNearbyZones } from "../services/zone";
import { getWeekStart } from "@fitarena/shared";

export async function zoneRoutes(app: FastifyInstance): Promise<void> {
  // Get zones (with optional location filter)
  app.get(
    "/api/v1/zones",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { city_id, lat, lng, radius = "10" } = request.query as {
        city_id?: string;
        lat?: string;
        lng?: string;
        radius?: string;
      };

      let zoneList;

      if (lat && lng) {
        zoneList = await getNearbyZones(
          parseFloat(lat),
          parseFloat(lng),
          parseFloat(radius)
        );
      } else if (city_id) {
        zoneList = await db.query.zones.findMany({
          where: eq(zones.cityId, city_id),
          limit: 50,
        });
      } else {
        zoneList = await db.query.zones.findMany({
          where: eq(zones.isActive, true),
          limit: 50,
        });
      }

      return reply.send({
        success: true,
        data: zoneList,
      });
    }
  );

  // Get zone by ID
  app.get(
    "/api/v1/zones/:id",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const zone = await db.query.zones.findFirst({
        where: eq(zones.id, id),
        with: {
          city: true,
          state: true,
        },
      });

      if (!zone) {
        return reply.status(404).send({
          success: false,
          error: { code: "ZONE_NOT_FOUND", message: "Zone not found" },
        });
      }

      // Get controller info
      let controller = null;
      if (zone.currentControllerGroupId) {
        controller = await db.query.groups.findFirst({
          where: eq(groups.id, zone.currentControllerGroupId),
          columns: { id: true, name: true, color: true, memberCount: true },
        });
      }

      // Check for close contest
      const contest = await isCloseContest(id);

      return reply.send({
        success: true,
        data: {
          ...zone,
          controller,
          isContested: contest.isClose,
          contestGap: contest.gap,
        },
      });
    }
  );

  // Get zone leaderboard
  app.get(
    "/api/v1/zones/:id/leaderboard",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const { period = "week" } = request.query as { period?: string };

      const leaderboard = await getZoneLeaderboard(id, 20);

      return reply.send({
        success: true,
        data: leaderboard,
      });
    }
  );

  // Get zone history (past controllers)
  app.get(
    "/api/v1/zones/:id/history",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const { weeks = "4" } = request.query as { weeks?: string };

      const weeksNum = parseInt(weeks, 10);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - weeksNum * 7);

      const history = await db
        .select({
          weekStart: zoneWeeklyScores.weekStart,
          groupId: zoneWeeklyScores.groupId,
          groupName: groups.name,
          groupColor: groups.color,
          totalAp: zoneWeeklyScores.totalAp,
          isController: zoneWeeklyScores.isController,
        })
        .from(zoneWeeklyScores)
        .innerJoin(groups, eq(zoneWeeklyScores.groupId, groups.id))
        .where(and(eq(zoneWeeklyScores.zoneId, id), eq(zoneWeeklyScores.isController, true)))
        .orderBy(desc(zoneWeeklyScores.weekStart))
        .limit(weeksNum);

      return reply.send({
        success: true,
        data: history,
      });
    }
  );

  // Get zone health (admin only - but accessible for demo)
  app.get(
    "/api/v1/zones/:id/health",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      const zone = await db.query.zones.findFirst({
        where: eq(zones.id, id),
        columns: {
          id: true,
          pinCode: true,
          zoneHealthScore: true,
          zoneHealthStatus: true,
          totalActiveUsers: true,
        },
      });

      if (!zone) {
        return reply.status(404).send({
          success: false,
          error: { code: "ZONE_NOT_FOUND", message: "Zone not found" },
        });
      }

      return reply.send({
        success: true,
        data: zone,
      });
    }
  );

  // Get map data for a bounding box
  app.get(
    "/api/v1/zones/map-data",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { bbox, zoom = "12" } = request.query as {
        bbox?: string;
        zoom?: string;
      };

      if (!bbox) {
        return reply.status(400).send({
          success: false,
          error: { code: "MISSING_BBOX", message: "Bounding box required" },
        });
      }

      // Parse bbox: sw_lat,sw_lng,ne_lat,ne_lng
      const [swLat, swLng, neLat, neLng] = bbox.split(",").map(parseFloat);

      // Get zones in bounding box
      const zonesInBbox = await db.query.zones.findMany({
        where: and(
          sql`${zones.centerLat}::numeric >= ${swLat}`,
          sql`${zones.centerLat}::numeric <= ${neLat}`,
          sql`${zones.centerLng}::numeric >= ${swLng}`,
          sql`${zones.centerLng}::numeric <= ${neLng}`
        ),
        limit: 100,
      });

      // Get current week scores for these zones
      const weekStart = getWeekStart();
      const weekStartStr = weekStart.toISOString().split("T")[0];

      const features = await Promise.all(
        zonesInBbox.map(async (zone) => {
          // Get controller info
          let controller = null;
          if (zone.currentControllerGroupId) {
            controller = await db.query.groups.findFirst({
              where: eq(groups.id, zone.currentControllerGroupId),
              columns: { id: true, name: true, color: true },
            });
          }

          // Get top score
          const [topScore] = await db
            .select({ totalAp: zoneWeeklyScores.totalAp })
            .from(zoneWeeklyScores)
            .where(
              and(
                eq(zoneWeeklyScores.zoneId, zone.id),
                eq(zoneWeeklyScores.weekStart, weekStartStr)
              )
            )
            .orderBy(desc(zoneWeeklyScores.totalAp))
            .limit(1);

          return {
            type: "Feature",
            properties: {
              id: zone.id,
              pinCode: zone.pinCode,
              zoneName: zone.zoneName,
              controllerId: controller?.id,
              controllerName: controller?.name,
              controllerColor: controller?.color || "#808080",
              totalAp: topScore?.totalAp || 0,
              isActive: zone.isActive,
              healthStatus: zone.zoneHealthStatus,
            },
            geometry: zone.boundaryGeojson || {
              type: "Point",
              coordinates: [
                parseFloat(zone.centerLng || "0"),
                parseFloat(zone.centerLat || "0"),
              ],
            },
          };
        })
      );

      return reply.send({
        success: true,
        data: {
          type: "FeatureCollection",
          features,
        },
      });
    }
  );
}
