import { db } from "../db";
import { eq, and, gte, desc } from "drizzle-orm";
import { users, activities, groups, groupMembers, zoneWeeklyScores, zones } from "@fitarena/db/schema";
import { config } from "../config";
import { getWeekStart, formatDuration } from "@fitarena/shared";
import { notificationQueue } from "../workers";

const WA_API_BASE = config.whatsapp.apiUrl;
const WA_API_KEY = config.whatsapp.apiKey;

/**
 * Send a WhatsApp template message via Business API (Interakt/AiSensy).
 * Returns true if the API accepted the message.
 */
async function sendWhatsAppTemplate(
  phoneNumber: string,
  templateName: string,
  parameters: string[]
): Promise<boolean> {
  try {
    const response = await fetch(`${WA_API_BASE}/messages/template`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WA_API_KEY}`,
      },
      body: JSON.stringify({
        to: phoneNumber,
        template: templateName,
        parameters,
      }),
    });

    if (!response.ok) {
      console.error(`[WhatsApp] Failed to send to ${phoneNumber}: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[WhatsApp] Error sending to ${phoneNumber}:`, error);
    return false;
  }
}

/**
 * Generate and send weekly digest to a user.
 * Called by the weekly digest scheduler (Sunday evening IST).
 */
export async function sendWeeklyDigest(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.phoneNumber) return false;

  const weekStart = getWeekStart();

  // Get user's weekly activities
  const weeklyActivities = await db
    .select({
      durationSeconds: activities.durationSeconds,
      arenaPoints: activities.arenaPoints,
      activityType: activities.activityType,
    })
    .from(activities)
    .where(
      and(
        eq(activities.userId, userId),
        gte(activities.startedAt, weekStart)
      )
    );

  const totalAp = weeklyActivities.reduce((sum, a) => sum + (a.arenaPoints ?? 0), 0);
  const totalDuration = weeklyActivities.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
  const activityCount = weeklyActivities.length;

  // Get user's groups and their zone ranks
  const userGroups = await db
    .select({
      groupName: groups.name,
      zoneRank: groups.zoneRank,
      weeklyAp: groups.currentWeekAp,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(
      and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.isActive, true)
      )
    );

  // Build digest message parameters
  const name = user.displayName ?? "Warrior";
  const duration = formatDuration(totalDuration);
  const streak = user.currentStreak ?? 0;

  const groupSummary = userGroups.length > 0
    ? userGroups.map((g) => `${g.groupName}: #${g.zoneRank ?? "?"} in zone`).join(", ")
    : "No groups yet";

  // Template: weekly_recap
  // Parameters: [name, totalAp, activityCount, duration, streak, groupSummary]
  return sendWhatsAppTemplate(
    user.phoneNumber,
    "weekly_recap",
    [name, totalAp.toString(), activityCount.toString(), duration, streak.toString(), groupSummary]
  );
}

/**
 * Send rival alert when zone gap is < 15%.
 * Called by the zone score update logic.
 */
export async function sendRivalAlert(
  zoneId: string,
  topGroupId: string,
  secondGroupId: string,
  gap: number
): Promise<void> {
  const weekStart = getWeekStart();

  // Get zone info
  const zone = await db.query.zones.findFirst({
    where: eq(zones.id, zoneId),
  });

  if (!zone) return;

  // Get both group names
  const [topGroup, secondGroup] = await Promise.all([
    db.query.groups.findFirst({ where: eq(groups.id, topGroupId) }),
    db.query.groups.findFirst({ where: eq(groups.id, secondGroupId) }),
  ]);

  if (!topGroup || !secondGroup) return;

  // Get members of BOTH groups to notify
  const allMembers = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.isActive, true),
      )
    );

  // Filter to members of these two groups only
  const topMembers = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, topGroupId), eq(groupMembers.isActive, true)));

  const secondMembers = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, secondGroupId), eq(groupMembers.isActive, true)));

  // Notify defending group (P1)
  for (const member of topMembers) {
    await notificationQueue.add("rival-alert", {
      type: "push" as const,
      userId: member.userId,
      title: `${zone.name} under attack! ⚔️`,
      body: `${secondGroup.name} is only ${gap}% behind in ${zone.name}. Defend your territory!`,
      data: { zoneId, type: "rival_alert" },
      priority: 2,
    });
  }

  // Notify challenging group (P2)
  for (const member of secondMembers) {
    await notificationQueue.add("rival-alert", {
      type: "push" as const,
      userId: member.userId,
      title: `Almost there! 🔥`,
      body: `You're only ${gap}% behind ${topGroup.name} in ${zone.name}. Push harder!`,
      data: { zoneId, type: "rival_alert" },
      priority: 2,
    });
  }
}

/**
 * Schedule weekly digests for all active users.
 * Should be called Sunday evening IST.
 */
export async function scheduleWeeklyDigests(): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all users active in the last 7 days
  const activeUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(gte(users.lastActiveAt, sevenDaysAgo));

  for (const user of activeUsers) {
    await notificationQueue.add("weekly-digest", {
      type: "whatsapp" as const,
      userId: user.id,
      title: "Weekly Recap",
      body: "Your weekly FitArena digest is ready",
      priority: 3,
    });
  }

  console.log(`[WhatsApp] Scheduled ${activeUsers.length} weekly digests`);
  return activeUsers.length;
}
