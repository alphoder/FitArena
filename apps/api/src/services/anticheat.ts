import { db } from "../db";
import { eq, and, gte, sql } from "drizzle-orm";
import { activities } from "@fitarena/db/schema";
import type { ActivityType } from "@fitarena/shared";

/**
 * Confidence Score Calculation (0.0 - 1.0)
 *
 * Weights from PRD:
 * - Source Trust:       30%
 * - Data Completeness:  25%
 * - Plausibility:       25%
 * - Pattern Match:      20%
 *
 * Thresholds:
 * - > 0.8: Trusted
 * - 0.6-0.8: Accepted with note
 * - 0.4-0.6: Flagged + reduced weight
 * - < 0.4: Auto-rejected
 * - Stake challenges require >= 0.8
 */

interface ConfidenceInput {
  userId: string;
  source: "strava" | "google_fit" | "terra" | "manual";
  activityType: ActivityType;
  durationSeconds: number;
  distanceMeters?: number;
  avgHeartRate?: number;
  hasGps: boolean;
  hasHeartRate: boolean;
  startedAt: Date;
}

interface ConfidenceResult {
  score: number;
  sourceTrust: number;
  dataCompleteness: number;
  plausibility: number;
  patternMatch: number;
  flags: string[];
}

// Source trust scores (30% weight)
const SOURCE_TRUST: Record<string, number> = {
  strava: 0.95,
  google_fit: 0.85,
  terra: 0.90,
  manual: 0.40,
};

// Expected pace ranges per activity type (meters per second)
const PACE_RANGES: Record<string, { min: number; max: number }> = {
  running_outdoor: { min: 1.5, max: 6.5 },    // 4:30-11:00 min/km
  running_treadmill: { min: 1.5, max: 5.5 },
  cycling_outdoor: { min: 3.0, max: 15.0 },    // 12-60 km/h
  cycling_indoor: { min: 3.0, max: 12.0 },
  swimming: { min: 0.5, max: 2.5 },
  walking: { min: 0.8, max: 2.5 },             // 3-9 km/h
};

// Max reasonable duration per activity type (seconds)
const MAX_DURATION: Record<string, number> = {
  running_outdoor: 18000,   // 5 hours
  running_treadmill: 7200,  // 2 hours
  cycling_outdoor: 28800,   // 8 hours
  cycling_indoor: 5400,     // 1.5 hours
  swimming: 7200,           // 2 hours
  gym: 10800,               // 3 hours
  walking: 14400,           // 4 hours
  yoga: 5400,               // 1.5 hours
  hiit: 3600,               // 1 hour
  dance: 5400,              // 1.5 hours
  home_workout: 5400,       // 1.5 hours
  sports: 10800,            // 3 hours
  other: 7200,              // 2 hours
};

export async function calculateConfidenceScore(
  input: ConfidenceInput
): Promise<ConfidenceResult> {
  const flags: string[] = [];

  // ── 1. Source Trust (30%) ──────────────────────────
  const sourceTrust = SOURCE_TRUST[input.source] ?? 0.4;

  // ── 2. Data Completeness (25%) ─────────────────────
  let completenessScore = 0.3; // Base: has duration + type

  if (input.hasGps) completenessScore += 0.25;
  if (input.hasHeartRate) completenessScore += 0.25;
  if (input.distanceMeters && input.distanceMeters > 0) completenessScore += 0.10;
  if (input.avgHeartRate && input.avgHeartRate > 0) completenessScore += 0.10;

  completenessScore = Math.min(completenessScore, 1.0);

  // ── 3. Plausibility (25%) ──────────────────────────
  let plausibilityScore = 1.0;

  // Check duration plausibility
  const maxDur = MAX_DURATION[input.activityType] ?? 7200;
  if (input.durationSeconds > maxDur) {
    plausibilityScore -= 0.3;
    flags.push(`Duration ${Math.round(input.durationSeconds / 60)}min exceeds max ${Math.round(maxDur / 60)}min for ${input.activityType}`);
  }

  if (input.durationSeconds < 60) {
    plausibilityScore -= 0.5;
    flags.push("Activity less than 1 minute");
  }

  // Check pace plausibility (if distance available)
  if (input.distanceMeters && input.durationSeconds > 0) {
    const pace = input.distanceMeters / input.durationSeconds; // m/s
    const expectedRange = PACE_RANGES[input.activityType];

    if (expectedRange) {
      if (pace > expectedRange.max * 1.5) {
        plausibilityScore -= 0.4;
        flags.push(`Pace ${(pace * 3.6).toFixed(1)} km/h is unrealistically fast`);
      } else if (pace < expectedRange.min * 0.5) {
        plausibilityScore -= 0.2;
        flags.push(`Pace ${(pace * 3.6).toFixed(1)} km/h is unusually slow`);
      }
    }
  }

  // Check heart rate plausibility
  if (input.avgHeartRate) {
    if (input.avgHeartRate > 220) {
      plausibilityScore -= 0.3;
      flags.push(`Heart rate ${input.avgHeartRate} bpm exceeds physiological maximum`);
    }
    if (input.avgHeartRate < 40) {
      plausibilityScore -= 0.2;
      flags.push(`Heart rate ${input.avgHeartRate} bpm is unusually low`);
    }
  }

  // Check for suspicious timing (e.g., 3AM activities)
  const hour = input.startedAt.getHours();
  if (hour >= 1 && hour <= 4) {
    plausibilityScore -= 0.1;
    flags.push("Activity logged between 1-4 AM");
  }

  plausibilityScore = Math.max(plausibilityScore, 0);

  // ── 4. Pattern Match (20%) ─────────────────────────
  let patternScore = 0.8; // Default: assume reasonable

  // Check user's recent activity pattern
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentActivities = await db
    .select({
      durationSeconds: activities.durationSeconds,
      arenaPoints: activities.arenaPoints,
    })
    .from(activities)
    .where(
      and(
        eq(activities.userId, input.userId),
        gte(activities.startedAt, sevenDaysAgo)
      )
    );

  // Check for activity frequency abuse (manual: max 3/day)
  if (input.source === "manual") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = await db
      .select({ id: activities.id })
      .from(activities)
      .where(
        and(
          eq(activities.userId, input.userId),
          eq(activities.source, "manual"),
          gte(activities.startedAt, today)
        )
      );

    if (todayActivities.length >= 3) {
      patternScore -= 0.5;
      flags.push(`Daily manual entry limit reached (${todayActivities.length}/3)`);
    }
  }

  // Check for volume spike (> 2x average)
  if (recentActivities.length >= 3) {
    const avgDuration =
      recentActivities.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0) /
      recentActivities.length;

    if (avgDuration > 0 && input.durationSeconds > avgDuration * 2.5) {
      patternScore -= 0.2;
      flags.push(
        `Duration ${Math.round(input.durationSeconds / 60)}min is >2.5x your avg ${Math.round(avgDuration / 60)}min`
      );
    }
  }

  patternScore = Math.max(patternScore, 0);

  // ── Final Weighted Score ───────────────────────────
  const score =
    sourceTrust * 0.3 +
    completenessScore * 0.25 +
    plausibilityScore * 0.25 +
    patternScore * 0.2;

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    sourceTrust,
    dataCompleteness: completenessScore,
    plausibility: plausibilityScore,
    patternMatch: patternScore,
    flags,
  };
}

/**
 * Determine action based on confidence score
 */
export function getConfidenceAction(score: number): {
  action: "trusted" | "accepted" | "flagged" | "rejected";
  apMultiplier: number;
} {
  if (score >= 0.8) return { action: "trusted", apMultiplier: 1.0 };
  if (score >= 0.6) return { action: "accepted", apMultiplier: 0.9 };
  if (score >= 0.4) return { action: "flagged", apMultiplier: 0.5 };
  return { action: "rejected", apMultiplier: 0 };
}
