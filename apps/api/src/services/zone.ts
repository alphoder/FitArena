import { db } from "../db";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import {
  zones,
  groups,
  zoneWeeklyScores,
  groupMembers,
  type Zone,
  type Group,
} from "@fitarena/db/schema";
import { getWeekStart, SCORE_LIMITS, type LeaderboardEntry } from "@fitarena/shared";

/**
 * Get zone by ID
 */
export async function getZoneById(zoneId: string): Promise<Zone | null> {
  const zone = await db.query.zones.findFirst({
    where: eq(zones.id, zoneId),
  });
  return zone || null;
}

/**
 * Get zone by pin code
 */
export async function getZoneByPinCode(pinCode: string): Promise<Zone | null> {
  const zone = await db.query.zones.findFirst({
    where: eq(zones.pinCode, pinCode),
  });
  return zone || null;
}

/**
 * Get or create zone for a pin code
 */
export async function getOrCreateZone(
  pinCode: string,
  cityId?: string,
  stateId?: string
): Promise<Zone> {
  let zone = await getZoneByPinCode(pinCode);

  if (!zone) {
    [zone] = await db
      .insert(zones)
      .values({
        pinCode,
        cityId,
        stateId,
        isActive: false,
      })
      .returning();
  }

  return zone;
}

/**
 * Get zone leaderboard for current week
 */
export async function getZoneLeaderboard(
  zoneId: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const scores = await db
    .select({
      groupId: zoneWeeklyScores.groupId,
      totalAp: zoneWeeklyScores.totalAp,
      groupName: groups.name,
    })
    .from(zoneWeeklyScores)
    .innerJoin(groups, eq(zoneWeeklyScores.groupId, groups.id))
    .where(
      and(
        eq(zoneWeeklyScores.zoneId, zoneId),
        eq(zoneWeeklyScores.weekStart, weekStartStr)
      )
    )
    .orderBy(desc(zoneWeeklyScores.totalAp))
    .limit(limit);

  return scores.map((score, index) => ({
    rank: index + 1,
    id: score.groupId,
    name: score.groupName,
    score: score.totalAp || 0,
  }));
}

/**
 * Calculate and update zone controller
 */
export async function updateZoneController(zoneId: string): Promise<void> {
  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Get top group
  const [topScore] = await db
    .select({
      groupId: zoneWeeklyScores.groupId,
      totalAp: zoneWeeklyScores.totalAp,
    })
    .from(zoneWeeklyScores)
    .where(
      and(
        eq(zoneWeeklyScores.zoneId, zoneId),
        eq(zoneWeeklyScores.weekStart, weekStartStr),
        gte(zoneWeeklyScores.totalAp, SCORE_LIMITS.zoneControlMinimum)
      )
    )
    .orderBy(desc(zoneWeeklyScores.totalAp))
    .limit(1);

  if (topScore) {
    // Update zone controller
    await db
      .update(zones)
      .set({
        currentControllerGroupId: topScore.groupId,
        controllerSince: new Date(),
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(zones.id, zoneId));

    // Update zone weekly scores
    await db
      .update(zoneWeeklyScores)
      .set({ isController: false, updatedAt: new Date() })
      .where(
        and(
          eq(zoneWeeklyScores.zoneId, zoneId),
          eq(zoneWeeklyScores.weekStart, weekStartStr)
        )
      );

    await db
      .update(zoneWeeklyScores)
      .set({ isController: true, updatedAt: new Date() })
      .where(
        and(
          eq(zoneWeeklyScores.zoneId, zoneId),
          eq(zoneWeeklyScores.groupId, topScore.groupId),
          eq(zoneWeeklyScores.weekStart, weekStartStr)
        )
      );
  }

  // Update ranks
  const scores = await db
    .select({ id: zoneWeeklyScores.id, totalAp: zoneWeeklyScores.totalAp })
    .from(zoneWeeklyScores)
    .where(
      and(
        eq(zoneWeeklyScores.zoneId, zoneId),
        eq(zoneWeeklyScores.weekStart, weekStartStr)
      )
    )
    .orderBy(desc(zoneWeeklyScores.totalAp));

  for (let i = 0; i < scores.length; i++) {
    await db
      .update(zoneWeeklyScores)
      .set({ rank: i + 1, updatedAt: new Date() })
      .where(eq(zoneWeeklyScores.id, scores[i].id));
  }
}

/**
 * Get groups competing in a zone
 */
export async function getZoneGroups(zoneId: string): Promise<Group[]> {
  return db.query.groups.findMany({
    where: and(eq(groups.homeZoneId, zoneId), eq(groups.isActive, true)),
  });
}

/**
 * Check if zone has a close contest (gap < 15%)
 */
export async function isCloseContest(zoneId: string): Promise<{
  isClose: boolean;
  gap?: number;
  topGroups?: { groupId: string; name: string; score: number }[];
}> {
  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const topTwo = await db
    .select({
      groupId: zoneWeeklyScores.groupId,
      totalAp: zoneWeeklyScores.totalAp,
      groupName: groups.name,
    })
    .from(zoneWeeklyScores)
    .innerJoin(groups, eq(zoneWeeklyScores.groupId, groups.id))
    .where(
      and(
        eq(zoneWeeklyScores.zoneId, zoneId),
        eq(zoneWeeklyScores.weekStart, weekStartStr)
      )
    )
    .orderBy(desc(zoneWeeklyScores.totalAp))
    .limit(2);

  if (topTwo.length < 2) {
    return { isClose: false };
  }

  const [first, second] = topTwo;
  const firstScore = first.totalAp || 0;
  const secondScore = second.totalAp || 0;

  if (firstScore === 0) {
    return { isClose: false };
  }

  const gap = ((firstScore - secondScore) / firstScore) * 100;

  return {
    isClose: gap < 15,
    gap: Math.round(gap),
    topGroups: topTwo.map((g) => ({
      groupId: g.groupId,
      name: g.groupName,
      score: g.totalAp || 0,
    })),
  };
}

/**
 * Get nearby zones based on coordinates
 */
export async function getNearbyZones(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<Zone[]> {
  // Simple bounding box query (not precise but fast)
  const latDiff = radiusKm / 111; // ~111km per degree latitude
  const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return db.query.zones.findMany({
    where: and(
      gte(zones.centerLat, (lat - latDiff).toString()),
      sql`${zones.centerLat} <= ${lat + latDiff}`,
      gte(zones.centerLng, (lng - lngDiff).toString()),
      sql`${zones.centerLng} <= ${lng + lngDiff}`
    ),
  });
}

/**
 * Weekly reset - archive scores and reset for new week
 */
export async function performWeeklyReset(): Promise<void> {
  const now = new Date();
  const weekStart = getWeekStart(now);

  // Archive current controller status
  // (The zoneWeeklyScores table already has historical data)

  // Reset group weekly AP
  await db.update(groups).set({
    currentWeekAp: 0,
    zoneRank: null,
    updatedAt: new Date(),
  });

  // Reset group member weekly AP
  await db.update(groupMembers).set({
    weeklyAp: 0,
  });

  console.log(`Weekly reset completed at ${now.toISOString()}`);
}
