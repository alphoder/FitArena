import {
  ACTIVITY_MULTIPLIERS,
  VERIFICATION_MULTIPLIERS,
  HR_ZONE_BONUSES,
  CONSISTENCY_BONUSES,
  SCORE_LIMITS,
  type ActivityType,
  type VerificationType,
  type HRZone,
} from "../types";

/**
 * Calculate base Arena Points for an activity
 */
export function calculateBaseAp(
  activityType: ActivityType,
  durationMinutes: number
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityType] || ACTIVITY_MULTIPLIERS.other;
  return Math.round(durationMinutes * multiplier);
}

/**
 * Calculate intensity bonus based on heart rate zone
 */
export function calculateIntensityBonus(
  baseAp: number,
  avgHrZone?: HRZone
): number {
  if (!avgHrZone) return 0;
  const bonusPercentage = HR_ZONE_BONUSES[avgHrZone] || 0;
  return Math.round(baseAp * bonusPercentage);
}

/**
 * Determine heart rate zone from average HR and age
 */
export function getHrZone(avgHeartRate: number, age: number = 30): HRZone {
  const maxHr = 220 - age;
  const percentage = (avgHeartRate / maxHr) * 100;

  if (percentage >= 90) return "zone5";
  if (percentage >= 80) return "zone4";
  if (percentage >= 70) return "zone3";
  if (percentage >= 60) return "zone2";
  return "zone1";
}

/**
 * Calculate consistency bonus based on streak
 */
export function calculateConsistencyBonus(streakDays: number): number {
  if (streakDays >= 7) return CONSISTENCY_BONUSES[7];
  if (streakDays >= 5) return CONSISTENCY_BONUSES[5];
  if (streakDays >= 3) return CONSISTENCY_BONUSES[3];
  return 0;
}

/**
 * Get verification multiplier based on data source
 */
export function getVerificationMultiplier(
  hasGps: boolean,
  hasHeartRate: boolean,
  source: string
): number {
  if (source === "manual") {
    return VERIFICATION_MULTIPLIERS.manual;
  }
  
  if (hasGps && hasHeartRate) {
    return VERIFICATION_MULTIPLIERS.device_gps_hr;
  }
  
  if (hasGps) {
    return VERIFICATION_MULTIPLIERS.device_gps;
  }
  
  return VERIFICATION_MULTIPLIERS.device_no_gps;
}

/**
 * Calculate total Arena Points for an activity
 */
export function calculateArenaPoints(params: {
  activityType: ActivityType;
  durationMinutes: number;
  avgHeartRate?: number;
  userAge?: number;
  streakDays?: number;
  hasGps: boolean;
  hasHeartRate: boolean;
  source: string;
}): {
  arenaPoints: number;
  baseAp: number;
  intensityBonus: number;
  consistencyBonus: number;
  verificationMult: number;
} {
  const {
    activityType,
    durationMinutes,
    avgHeartRate,
    userAge = 30,
    streakDays = 0,
    hasGps,
    hasHeartRate,
    source,
  } = params;

  // Calculate base AP
  const baseAp = calculateBaseAp(activityType, durationMinutes);

  // Calculate intensity bonus
  let intensityBonus = 0;
  if (avgHeartRate) {
    const hrZone = getHrZone(avgHeartRate, userAge);
    intensityBonus = calculateIntensityBonus(baseAp, hrZone);
  }

  // Calculate consistency bonus
  const consistencyBonus = calculateConsistencyBonus(streakDays);

  // Get verification multiplier
  const verificationMult = getVerificationMultiplier(hasGps, hasHeartRate, source);

  // Calculate total AP
  let arenaPoints = Math.round((baseAp + intensityBonus + consistencyBonus) * verificationMult);

  // Apply cap
  arenaPoints = Math.min(arenaPoints, SCORE_LIMITS.maxApPerActivity);

  return {
    arenaPoints,
    baseAp,
    intensityBonus,
    consistencyBonus,
    verificationMult,
  };
}

/**
 * Calculate group score from member scores
 * Uses top N members (max 10)
 */
export function calculateGroupScore(memberScores: number[]): number {
  const sortedScores = [...memberScores].sort((a, b) => b - a);
  const topN = sortedScores.slice(0, 10);
  return topN.reduce((sum, score) => sum + score, 0);
}

/**
 * Check if a zone has enough activity to be claimed
 */
export function canClaimZone(totalAp: number): boolean {
  return totalAp >= SCORE_LIMITS.zoneControlMinimum;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format distance in meters to human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

/**
 * Generate a random invite code
 */
export function generateInviteCode(length: number = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get week start date (Monday 00:00 IST)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get week end date (Sunday 23:59:59 IST)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Check if a date is within the current week
 */
export function isCurrentWeek(date: Date): boolean {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  return date >= weekStart && date <= weekEnd;
}

/**
 * Calculate percentage change between two values
 */
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Map Strava sport type to FitArena activity type
 */
export function mapStravaActivityType(stravaSportType: string): ActivityType {
  const mapping: Record<string, ActivityType> = {
    Run: "running_outdoor",
    VirtualRun: "running_treadmill",
    Ride: "cycling_outdoor",
    VirtualRide: "cycling_indoor",
    Swim: "swimming",
    WeightTraining: "gym",
    Yoga: "yoga",
    Walk: "walking",
    Hike: "walking",
    Crossfit: "hiit",
    Workout: "gym",
    Soccer: "sports",
    Basketball: "sports",
    Tennis: "sports",
    Badminton: "sports",
    Cricket: "sports",
  };

  return mapping[stravaSportType] || "other";
}

/**
 * Map Google Fit activity type to FitArena activity type
 */
export function mapGoogleFitActivityType(activityType: number): ActivityType {
  const mapping: Record<number, ActivityType> = {
    7: "walking",
    8: "running_outdoor",
    1: "cycling_outdoor",
    80: "gym",
    35: "walking", // Hiking
    82: "yoga",
    16: "swimming",
  };

  return mapping[activityType] || "other";
}
