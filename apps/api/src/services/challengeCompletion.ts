import { db } from "../db";
import { eq, and, lte } from "drizzle-orm";
import { challenges, challengeParticipants } from "@fitarena/db/schema";
import { distributeStakeWinnings } from "./payments";
import { notificationQueue } from "../workers";

/**
 * Process all challenges that have ended.
 * Called by a scheduled job or manually.
 */
export async function processEndedChallenges(): Promise<number> {
  const now = new Date();

  // Find all active challenges past their end date
  const endedChallenges = await db.query.challenges.findMany({
    where: and(
      eq(challenges.status, "active"),
      lte(challenges.endsAt, now)
    ),
  });

  let processed = 0;

  for (const challenge of endedChallenges) {
    try {
      await completeChallenge(challenge.id);
      processed++;
    } catch (error) {
      console.error(`[ChallengeCompletion] Failed for ${challenge.id}:`, error);
    }
  }

  console.log(`[ChallengeCompletion] Processed ${processed} challenges`);
  return processed;
}

/**
 * Complete a single challenge: determine winners, update statuses, distribute stakes.
 */
async function completeChallenge(challengeId: string): Promise<void> {
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) return;

  // Get all participants
  const participants = await db.query.challengeParticipants.findMany({
    where: eq(challengeParticipants.challengeId, challengeId),
  });

  // Determine who met the target
  const completedParticipants = participants.filter((p) => p.targetMet);

  // Rank all participants by progress (descending)
  const ranked = [...participants].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));

  // Update ranks
  for (let i = 0; i < ranked.length; i++) {
    await db
      .update(challengeParticipants)
      .set({ rank: i + 1, updatedAt: new Date() })
      .where(eq(challengeParticipants.id, ranked[i].id));
  }

  // Mark challenge as completed
  await db
    .update(challenges)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(challenges.id, challengeId));

  // Handle stake distribution
  if (challenge.stakeAmount && challenge.stakeAmount > 0) {
    const result = await distributeStakeWinnings(challengeId);

    if (result.winnerId) {
      await notificationQueue.add("stake-win", {
        type: "push" as const,
        userId: result.winnerId,
        title: "You Won! 💰",
        body: `You won ₹${(result.winnerPayout / 100).toFixed(0)} in "${challenge.name}"!`,
        data: { challengeId, type: "stake_win" },
        priority: 1,
      });
    }
  }

  // Notify all participants
  for (const participant of participants) {
    const rank = ranked.findIndex((p) => p.id === participant.id) + 1;
    const isWinner = rank === 1;
    const metTarget = participant.targetMet;

    await notificationQueue.add("challenge-complete", {
      type: "push" as const,
      userId: participant.userId,
      title: isWinner
        ? `Challenge Won! 🏆`
        : metTarget
        ? `Challenge Complete! ✅`
        : `Challenge Ended`,
      body: isWinner
        ? `You finished #1 in "${challenge.name}"!`
        : metTarget
        ? `You completed "${challenge.name}" (Rank #${rank})`
        : `"${challenge.name}" ended. You reached ${participant.progress ?? 0}/${challenge.targetValue}.`,
      data: { challengeId, rank: rank.toString() },
      priority: 2,
    });
  }

  console.log(`[ChallengeCompletion] Completed challenge ${challengeId}: ${completedParticipants.length}/${participants.length} met target`);
}

/**
 * Update progress for a participant after they log an activity.
 * Call this from the activity creation flow.
 */
export async function updateChallengeProgress(
  userId: string,
  activityAp: number,
  activityType: string,
  durationSeconds: number,
  distanceMeters: number | null
): Promise<void> {
  // Find all active challenges this user is in
  const userParticipations = await db.query.challengeParticipants.findMany({
    where: and(
      eq(challengeParticipants.userId, userId),
    ),
  });

  for (const participation of userParticipations) {
    const challenge = await db.query.challenges.findFirst({
      where: and(
        eq(challenges.id, participation.challengeId),
        eq(challenges.status, "active")
      ),
    });

    if (!challenge) continue;

    let progressIncrement = 0;

    switch (challenge.targetType) {
      case "ap_total":
        progressIncrement = activityAp;
        break;
      case "activity_count":
        progressIncrement = 1;
        break;
      case "distance":
        progressIncrement = distanceMeters ? Math.round(distanceMeters / 1000) : 0; // km
        break;
      case "streak":
        // Streak is handled differently — check consecutive days
        // For simplicity, increment by 1 if this is the first activity today
        progressIncrement = 1;
        break;
    }

    if (progressIncrement > 0) {
      const newProgress = (participation.progress ?? 0) + progressIncrement;
      const targetMet = newProgress >= challenge.targetValue;

      await db
        .update(challengeParticipants)
        .set({
          progress: newProgress,
          targetMet,
          updatedAt: new Date(),
        })
        .where(eq(challengeParticipants.id, participation.id));
    }
  }
}
