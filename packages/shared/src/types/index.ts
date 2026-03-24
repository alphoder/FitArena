// Activity types and their AP multipliers (per minute)
export const ACTIVITY_MULTIPLIERS = {
  running_outdoor: 2.0,
  running_treadmill: 1.5,
  cycling_outdoor: 1.5,
  cycling_indoor: 1.2,
  swimming: 2.2,
  gym: 1.3,
  walking: 0.8,
  yoga: 1.0,
  sports: 1.5,
  hiit: 2.0,
  dance: 1.2,
  home_workout: 1.0,
  other: 0.8,
} as const;

export type ActivityType = keyof typeof ACTIVITY_MULTIPLIERS;

// Verification multipliers based on data source
export const VERIFICATION_MULTIPLIERS = {
  device_gps_hr: 1.0,
  device_gps: 0.95,
  device_no_gps: 0.9,
  manual: 0.7,
} as const;

export type VerificationType = keyof typeof VERIFICATION_MULTIPLIERS;

// Heart rate zones for intensity bonus
export const HR_ZONE_BONUSES = {
  zone1: 0,    // 50-60% max HR
  zone2: 0.10, // 60-70% max HR
  zone3: 0.20, // 70-80% max HR
  zone4: 0.30, // 80-90% max HR
  zone5: 0.40, // 90-100% max HR
} as const;

export type HRZone = keyof typeof HR_ZONE_BONUSES;

// Consistency bonus thresholds
export const CONSISTENCY_BONUSES = {
  3: 10,  // 3 days in a row
  5: 25,  // 5 days in a row
  7: 50,  // 7 days in a row
} as const;

// Score limits
export const SCORE_LIMITS = {
  maxApPerActivity: 200,
  maxApPerDay: 300,
  maxApPerWeek: 1500,
  minActivityMinutes: 15, // For active day
  zoneControlMinimum: 500, // Minimum total AP for zone control
} as const;

// Group limits
export const GROUP_LIMITS = {
  maxMembersDefault: 50,
  maxMembersGym: 200,
  maxMembersClub: 200,
  maxScoringMembers: 10, // Top N members for group score
} as const;

// Zone health thresholds
export const ZONE_HEALTH_THRESHOLDS = {
  GREEN: 80,
  YELLOW: 60,
  ORANGE: 40,
  RED: 0,
} as const;

export type ZoneHealthStatus = keyof typeof ZONE_HEALTH_THRESHOLDS;

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
  };
}

// User related types
export interface UserProfile {
  id: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  level: number;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  homeZoneId: string | null;
  badges: string[];
}

export interface UserStats {
  totalAp: number;
  activityCount: number;
  currentStreak: number;
  zoneRank: number | null;
  groupRank: number | null;
}

// Group related types
export interface GroupSummary {
  id: string;
  name: string;
  type: string;
  color: string | null;
  memberCount: number;
  currentWeekAp: number;
  zoneRank: number | null;
}

// Zone related types
export interface ZoneSummary {
  id: string;
  pinCode: string;
  zoneName: string | null;
  controllerGroupId: string | null;
  controllerGroupName: string | null;
  totalAp: number;
  groupCount: number;
}

// Activity related types
export interface ActivitySummary {
  id: string;
  type: ActivityType;
  startedAt: string;
  durationSeconds: number;
  arenaPoints: number;
  source: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  change?: number; // Position change from previous period
}

// Challenge types
export interface ChallengeSummary {
  id: string;
  name: string;
  type: string;
  status: string;
  startsAt: string;
  endsAt: string;
  participantCount: number;
  userProgress?: number;
}
