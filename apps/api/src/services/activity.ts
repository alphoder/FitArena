import { db } from "../db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import {
  activities,
  users,
  groupMembers,
  zoneWeeklyScores,
  type NewActivity,
  type Activity,
} from "@fitarena/db/schema";
import {
  calculateArenaPoints,
  getWeekStart,
  getWeekEnd,
  type ActivityType,
} from "@fitarena/shared";

interface CreateActivityParams {
  userId: string;
  source: "strava" | "google_fit" | "terra" | "manual";
  sourceActivityId?: string;
  activityType: ActivityType;
  startedAt: Date;
  durationSeconds: number;
  distanceMeters?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  heartRateZones?: Record<string, number>;
  hasGps?: boolean;
  routePolyline?: string;
  startLat?: number;
  startLng?: number;
  zoneId?: string;
  rawData?: unknown;
}

/**
 * Create a new activity and calculate AP
 */
export async function createActivity(params: CreateActivityParams): Promise<Activity> {
  const {
    userId,
    source,
    sourceActivityId,
    activityType,
    startedAt,
    durationSeconds,
    distanceMeters,
    calories,
    avgHeartRate,
    maxHeartRate,
    heartRateZones,
    hasGps = false,
    routePolyline,
    startLat,
    startLng,
    zoneId,
    rawData,
  } = params;

  // Get user's current streak
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentStreak: true, homeZoneId: true },
  });

  const durationMinutes = Math.floor(durationSeconds / 60);

  // Calculate Arena Points
  const apResult = calculateArenaPoints({
    activityType,
    durationMinutes,
    avgHeartRate,
    userAge: 30, // TODO: Calculate from user's DOB
    streakDays: user?.currentStreak || 0,
    hasGps,
    hasHeartRate: !!avgHeartRate,
    source,
  });

  // Determine zone (use provided zone or user's home zone)
  const activityZoneId = zoneId || user?.homeZoneId;

  // Create the activity
  const [activity] = await db
    .insert(activities)
    .values({
      userId,
      source,
      sourceActivityId,
      activityType,
      startedAt,
      durationSeconds,
      distanceMeters,
      calories,
      avgHeartRate,
      maxHeartRate,
      heartRateZones,
      hasGps,
      routePolyline,
      startLat: startLat?.toString(),
      startLng: startLng?.toString(),
      zoneId: activityZoneId,
      arenaPoints: apResult.arenaPoints,
      baseAp: apResult.baseAp,
      intensityBonus: apResult.intensityBonus,
      consistencyBonus: apResult.consistencyBonus,
      verificationMult: apResult.verificationMult.toString(),
      rawData,
      processedAt: new Date(),
    })
    .returning();

  // Update user's streak and last active
  await updateUserStreak(userId, startedAt);

  // Update group scores
  await updateGroupScores(userId, activityZoneId, apResult.arenaPoints);

  return activity;
}

/**
 * Update user's streak based on activity date
 */
async function updateUserStreak(userId: string, activityDate: Date): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { currentStreak: true, longestStreak: true, streakLastActive: true },
  });

  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activityDay = new Date(activityDate);
  activityDay.setHours(0, 0, 0, 0);

  let newStreak = user.currentStreak || 0;

  if (user.streakLastActive) {
    const lastActive = new Date(user.streakLastActive);
    lastActive.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor(
      (activityDay.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, no change
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak++;
    } else {
      // Gap in streak, reset to 1
      newStreak = 1;
    }
  } else {
    // First activity
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, user.longestStreak || 0);

  await db
    .update(users)
    .set({
      currentStreak: newStreak,
      longestStreak,
      streakLastActive: activityDay.toISOString().split("T")[0],
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Update group and zone scores after an activity
 */
async function updateGroupScores(
  userId: string,
  zoneId: string | null,
  arenaPoints: number
): Promise<void> {
  // Get user's group memberships
  const memberships = await db.query.groupMembers.findMany({
    where: and(eq(groupMembers.userId, userId), eq(groupMembers.isActive, true)),
    with: {
      group: true,
    },
  });

  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split("T")[0];

  for (const membership of memberships) {
    if (!membership.group) continue;

    // Update member's weekly AP
    await db
      .update(groupMembers)
      .set({
        weeklyAp: sql`${groupMembers.weeklyAp} + ${arenaPoints}`,
      })
      .where(eq(groupMembers.id, membership.id));

    // Update zone weekly scores if zone matches
    const groupZoneId = membership.group.homeZoneId;
    
    if (groupZoneId) {
      // Upsert zone weekly score
      await db
        .insert(zoneWeeklyScores)
        .values({
          zoneId: groupZoneId,
          groupId: membership.group.id,
          weekStart: weekStartStr,
          totalAp: arenaPoints,
          activeMembers: 1,
        })
        .onConflictDoUpdate({
          target: [zoneWeeklyScores.zoneId, zoneWeeklyScores.groupId, zoneWeeklyScores.weekStart],
          set: {
            totalAp: sql`${zoneWeeklyScores.totalAp} + ${arenaPoints}`,
            updatedAt: new Date(),
          },
        });
    }
  }
}

/**
 * Get user's activities for the current week
 */
export async function getUserWeeklyActivities(userId: string): Promise<Activity[]> {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  return db.query.activities.findMany({
    where: and(
      eq(activities.userId, userId),
      gte(activities.startedAt, weekStart),
      lte(activities.startedAt, weekEnd)
    ),
    orderBy: desc(activities.startedAt),
  });
}

/**
 * Get user's weekly AP total
 */
export async function getUserWeeklyAp(userId: string): Promise<number> {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${activities.arenaPoints}), 0)` })
    .from(activities)
    .where(
      and(
        eq(activities.userId, userId),
        gte(activities.startedAt, weekStart),
        lte(activities.startedAt, weekEnd)
      )
    );

  return result[0]?.total || 0;
}

/**
 * Check for duplicate activity from external source
 */
export async function isDuplicateActivity(
  userId: string,
  source: string,
  sourceActivityId: string
): Promise<boolean> {
  const existing = await db.query.activities.findFirst({
    where: and(
      eq(activities.userId, userId),
      eq(activities.source, source as any),
      eq(activities.sourceActivityId, sourceActivityId)
    ),
  });

  return !!existing;
}
