import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { users } from "@fitarena/db/schema";
import { notificationQueue } from "../workers";

// ── XP Events from PRD ─────────────────────────────────

const XP_EVENTS = {
  activity_logged: 10,
  daily_streak: 5,        // per day
  zone_participation: 25,
  zone_control: 50,
  challenge_complete: 20,  // base, up to 100 for stakes
  group_creation: 50,
  invite_accepted: 25,
  tracker_connected: 30,
} as const;

// ── Level Thresholds from PRD ───────────────────────────

const LEVELS = [
  { level: 1, name: "Newcomer", xp: 0 },
  { level: 2, name: "Regular", xp: 100 },
  { level: 3, name: "Active", xp: 300 },
  { level: 4, name: "Committed", xp: 600 },
  { level: 5, name: "Dedicated", xp: 1000 },
  { level: 6, name: "Warrior", xp: 1500 },
  { level: 7, name: "Champion", xp: 2500 },
  { level: 8, name: "Legend", xp: 4000 },
  { level: 9, name: "Elite", xp: 6000 },
  { level: 10, name: "Apex", xp: 10000 },
] as const;

function getLevelForXp(xp: number): { level: number; name: string } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return LEVELS[i];
  }
  return LEVELS[0];
}

/**
 * Award XP to a user for a specific event.
 * Handles level-up detection and notifications.
 */
export async function awardXp(
  userId: string,
  event: keyof typeof XP_EVENTS,
  multiplier: number = 1
): Promise<{ xpAwarded: number; newTotal: number; leveledUp: boolean; newLevel: number }> {
  const xpAmount = Math.round(XP_EVENTS[event] * multiplier);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return { xpAwarded: 0, newTotal: 0, leveledUp: false, newLevel: 1 };

  const oldXp = user.xpTotal ?? 0;
  const newXp = oldXp + xpAmount;
  const oldLevel = getLevelForXp(oldXp);
  const newLevel = getLevelForXp(newXp);
  const leveledUp = newLevel.level > oldLevel.level;

  // Update user XP and level
  await db
    .update(users)
    .set({
      xpTotal: newXp,
      level: newLevel.level,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Notify on level up
  if (leveledUp) {
    await notificationQueue.add("level-up", {
      type: "push" as const,
      userId,
      title: `Level Up! 🎉`,
      body: `You've reached Level ${newLevel.level}: ${newLevel.name}!`,
      data: { level: newLevel.level.toString(), name: newLevel.name },
      priority: 1,
    });
  }

  return {
    xpAwarded: xpAmount,
    newTotal: newXp,
    leveledUp,
    newLevel: newLevel.level,
  };
}

// ── Streak System ───────────────────────────────────────

const STREAK_FREEZE_LIMIT_FREE = 1;   // per month
const STREAK_FREEZE_LIMIT_PREMIUM = 3; // per month

/**
 * Update user's streak after an activity.
 * An "active day" = 15+ minutes of activity.
 * Users get 1 rest day per week without breaking streak.
 */
export async function updateStreak(userId: string, activityDurationMinutes: number): Promise<{
  streakUpdated: boolean;
  currentStreak: number;
  isNewDay: boolean;
}> {
  if (activityDurationMinutes < 15) {
    return { streakUpdated: false, currentStreak: 0, isNewDay: false };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return { streakUpdated: false, currentStreak: 0, isNewDay: false };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = user.streakLastActive ? new Date(user.streakLastActive) : null;
  const lastActiveDay = lastActive
    ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
    : null;

  // Already logged today
  if (lastActiveDay && today.getTime() === lastActiveDay.getTime()) {
    return { streakUpdated: false, currentStreak: user.currentStreak ?? 0, isNewDay: false };
  }

  const daysSinceLastActive = lastActiveDay
    ? Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  let newStreak: number;

  if (daysSinceLastActive === 1) {
    // Consecutive day — increment streak
    newStreak = (user.currentStreak ?? 0) + 1;
  } else if (daysSinceLastActive === 2) {
    // 1 rest day allowed per week — check if within allowance
    // Simple rule: allow 1 gap day, don't break streak
    newStreak = (user.currentStreak ?? 0) + 1;
  } else {
    // Gap too large — reset streak
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, user.longestStreak ?? 0);

  await db
    .update(users)
    .set({
      currentStreak: newStreak,
      longestStreak,
      streakLastActive: now,
      lastActiveAt: now,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  // Award streak XP
  await awardXp(userId, "daily_streak");

  // Notify on milestone streaks
  if ([3, 7, 14, 30, 60, 100].includes(newStreak)) {
    await notificationQueue.add("streak-milestone", {
      type: "push" as const,
      userId,
      title: `${newStreak}-Day Streak! 🔥`,
      body: `Incredible consistency! You've been active for ${newStreak} days straight.`,
      data: { streak: newStreak.toString() },
      priority: 2,
    });
  }

  return { streakUpdated: true, currentStreak: newStreak, isNewDay: true };
}

/**
 * Use a streak freeze to prevent streak loss.
 * Returns true if freeze was applied.
 */
export async function useStreakFreeze(userId: string, isPremium: boolean): Promise<boolean> {
  const limit = isPremium ? STREAK_FREEZE_LIMIT_PREMIUM : STREAK_FREEZE_LIMIT_FREE;

  // Check monthly freeze usage (stored in Redis for simplicity)
  // For now, just check and allow
  // TODO: Track freeze usage in Redis with monthly expiry

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || (user.currentStreak ?? 0) === 0) return false;

  // Extend streakLastActive to today to prevent reset
  await db
    .update(users)
    .set({
      streakLastActive: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return true;
}

/**
 * Calculate group streak.
 * A group has an active streak day when 60%+ of members are active.
 */
export async function getGroupStreakStatus(
  memberStreaks: { userId: string; isActiveToday: boolean }[]
): Promise<{ isActiveDay: boolean; participationRate: number }> {
  const activeCount = memberStreaks.filter((m) => m.isActiveToday).length;
  const total = memberStreaks.length;
  const participationRate = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  return {
    isActiveDay: participationRate >= 60,
    participationRate,
  };
}
