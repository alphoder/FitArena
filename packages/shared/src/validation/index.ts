import { z } from "zod";
import { ACTIVITY_MULTIPLIERS } from "../types";

// Phone number validation (Indian format)
export const phoneNumberSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
  .transform((val) => `+91${val}`);

// OTP validation
export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d+$/, "OTP must only contain digits");

// Auth schemas
export const sendOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid phone number"),
});

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid phone number"),
  otp: otpSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

// User schemas
export const updateUserSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  homePinCode: z.string().length(6).regex(/^\d+$/).optional(),
  languagePref: z.enum(["en", "hi"]).optional(),
});

// Activity schemas
export const activityTypeSchema = z.enum(
  Object.keys(ACTIVITY_MULTIPLIERS) as [string, ...string[]]
);

export const createActivitySchema = z.object({
  activityType: activityTypeSchema,
  durationSeconds: z.number().int().min(60).max(14400), // 1 min to 4 hours
  distanceMeters: z.number().int().positive().optional(),
  calories: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
  startedAt: z.string().datetime().optional(), // Defaults to now
});

// Group schemas
export const groupTypeSchema = z.enum(["open", "invite", "gym", "club", "coach"]);
export const privacyTypeSchema = z.enum(["public", "unlisted", "private"]);

export const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  type: groupTypeSchema,
  description: z.string().max(500).optional(),
  homeZoneId: z.string().uuid(),
  privacy: privacyTypeSchema.default("public"),
});

export const updateGroupSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  motto: z.string().max(200).optional(),
  privacy: privacyTypeSchema.optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().length(8).optional(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member", "observer"]),
});

// Challenge schemas
export const challengeTypeSchema = z.enum(["group", "versus", "zone", "coach", "stake"]);
export const targetTypeSchema = z.enum(["ap_total", "activity_count", "streak", "distance", "custom"]);

export const createChallengeSchema = z.object({
  name: z.string().min(3).max(200),
  type: challengeTypeSchema,
  description: z.string().max(1000).optional(),
  targetType: targetTypeSchema,
  targetValue: z.number().int().positive(),
  activityTypeFilter: activityTypeSchema.optional(),
  durationDays: z.number().int().min(1).max(90),
  startsAt: z.string().datetime(),
  stakeAmount: z.number().int().min(100).max(500000).optional(), // In paise
  verificationRequired: z.boolean().default(false),
});

// Gym schemas
export const createGymSchema = z.object({
  name: z.string().min(3).max(200),
  address: z.string().max(500).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  website: z.string().url().optional(),
  operatingHours: z.record(z.string()).optional(),
});

// Coach schemas
export const registerCoachSchema = z.object({
  specialization: z.string().max(100).optional(),
  certification: z.string().max(200).optional(),
  gymId: z.string().uuid().optional(),
  bio: z.string().max(1000).optional(),
});

export const inviteClientSchema = z.object({
  phoneNumber: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid phone number"),
});

// Notification settings
export const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  quietHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }).optional(),
});

// Pagination
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// Period filter
export const periodSchema = z.enum(["week", "month", "season", "all"]);

// Date range
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// Strava webhook payload
export const stravaWebhookSchema = z.object({
  object_type: z.enum(["activity", "athlete"]),
  object_id: z.number(),
  aspect_type: z.enum(["create", "update", "delete"]),
  owner_id: z.number(),
  subscription_id: z.number(),
  event_time: z.number(),
  updates: z.record(z.unknown()).optional(),
});

// Strava subscription verification
export const stravaSubscriptionVerifySchema = z.object({
  "hub.mode": z.literal("subscribe"),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

// Export all schemas
export const schemas = {
  auth: {
    sendOtp: sendOtpSchema,
    verifyOtp: verifyOtpSchema,
    refreshToken: refreshTokenSchema,
  },
  user: {
    update: updateUserSchema,
  },
  activity: {
    create: createActivitySchema,
  },
  group: {
    create: createGroupSchema,
    update: updateGroupSchema,
    join: joinGroupSchema,
    updateMemberRole: updateMemberRoleSchema,
  },
  challenge: {
    create: createChallengeSchema,
  },
  gym: {
    create: createGymSchema,
  },
  coach: {
    register: registerCoachSchema,
    inviteClient: inviteClientSchema,
  },
  notifications: {
    settings: notificationSettingsSchema,
  },
  strava: {
    webhook: stravaWebhookSchema,
    subscriptionVerify: stravaSubscriptionVerifySchema,
  },
};
