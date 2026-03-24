import { relations } from "drizzle-orm";
import { states } from "./states";
import { cities } from "./cities";
import { zones } from "./zones";
import { users } from "./users";
import { gyms } from "./gyms";
import { coaches } from "./coaches";
import { groups, groupMembers } from "./groups";
import { activities } from "./activities";
import { challenges, challengeParticipants } from "./challenges";
import { zoneWeeklyScores } from "./zone-scores";
import { badges, userBadges, seasons } from "./badges";
import { oauthTokens } from "./oauth-tokens";
import { notifications, whatsappMessages } from "./notifications";
import { zoneHealthLogs } from "./zone-health";

// State relations
export const statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
  zones: many(zones),
}));

// City relations
export const citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  zones: many(zones),
  gyms: many(gyms),
  users: many(users),
}));

// Zone relations
export const zonesRelations = relations(zones, ({ one, many }) => ({
  city: one(cities, {
    fields: [zones.cityId],
    references: [cities.id],
  }),
  state: one(states, {
    fields: [zones.stateId],
    references: [states.id],
  }),
  controllerGroup: one(groups, {
    fields: [zones.currentControllerGroupId],
    references: [groups.id],
  }),
  gyms: many(gyms),
  groups: many(groups),
  activities: many(activities),
  weeklyScores: many(zoneWeeklyScores),
  healthLogs: many(zoneHealthLogs),
}));

// Gym relations
export const gymsRelations = relations(gyms, ({ one, many }) => ({
  zone: one(zones, {
    fields: [gyms.zoneId],
    references: [zones.id],
  }),
  city: one(cities, {
    fields: [gyms.cityId],
    references: [cities.id],
  }),
  owner: one(users, {
    fields: [gyms.ownerUserId],
    references: [users.id],
  }),
  coaches: many(coaches),
  groups: many(groups),
}));

// Coach relations
export const coachesRelations = relations(coaches, ({ one, many }) => ({
  user: one(users, {
    fields: [coaches.userId],
    references: [users.id],
  }),
  gym: one(gyms, {
    fields: [coaches.gymId],
    references: [gyms.id],
  }),
  clients: many(users),
  groups: many(groups),
  challenges: many(challenges),
}));

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  homeZone: one(zones, {
    fields: [users.homeZoneId],
    references: [zones.id],
  }),
  city: one(cities, {
    fields: [users.cityId],
    references: [cities.id],
  }),
  coach: one(coaches, {
    fields: [users.coachId],
    references: [coaches.id],
  }),
  coachProfile: one(coaches, {
    fields: [users.id],
    references: [coaches.userId],
  }),
  activities: many(activities),
  groupMemberships: many(groupMembers),
  badges: many(userBadges),
  oauthTokens: many(oauthTokens),
  notifications: many(notifications),
  createdChallenges: many(challenges),
  challengeParticipations: many(challengeParticipants),
  ownedGroups: many(groups),
}));

// Group relations
export const groupsRelations = relations(groups, ({ one, many }) => ({
  homeZone: one(zones, {
    fields: [groups.homeZoneId],
    references: [zones.id],
  }),
  gym: one(gyms, {
    fields: [groups.gymId],
    references: [gyms.id],
  }),
  coach: one(coaches, {
    fields: [groups.coachId],
    references: [coaches.id],
  }),
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),
  members: many(groupMembers),
  weeklyScores: many(zoneWeeklyScores),
  challenges: many(challenges),
  challengeParticipations: many(challengeParticipants),
}));

// Group Member relations
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

// Activity relations
export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  zone: one(zones, {
    fields: [activities.zoneId],
    references: [zones.id],
  }),
}));

// Challenge relations
export const challengesRelations = relations(challenges, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [challenges.createdByUserId],
    references: [users.id],
  }),
  createdByGroup: one(groups, {
    fields: [challenges.createdByGroupId],
    references: [groups.id],
  }),
  createdByCoach: one(coaches, {
    fields: [challenges.createdByCoachId],
    references: [coaches.id],
  }),
  participants: many(challengeParticipants),
}));

// Challenge Participant relations
export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeParticipants.challengeId],
    references: [challenges.id],
  }),
  user: one(users, {
    fields: [challengeParticipants.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [challengeParticipants.groupId],
    references: [groups.id],
  }),
}));

// Zone Weekly Score relations
export const zoneWeeklyScoresRelations = relations(zoneWeeklyScores, ({ one }) => ({
  zone: one(zones, {
    fields: [zoneWeeklyScores.zoneId],
    references: [zones.id],
  }),
  group: one(groups, {
    fields: [zoneWeeklyScores.groupId],
    references: [groups.id],
  }),
}));

// Badge relations
export const badgesRelations = relations(badges, ({ one, many }) => ({
  season: one(seasons, {
    fields: [badges.seasonId],
    references: [seasons.id],
  }),
  earnedBy: many(userBadges),
}));

// User Badge relations
export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// Season relations
export const seasonsRelations = relations(seasons, ({ many }) => ({
  badges: many(badges),
}));

// OAuth Token relations
export const oauthTokensRelations = relations(oauthTokens, ({ one }) => ({
  user: one(users, {
    fields: [oauthTokens.userId],
    references: [users.id],
  }),
  zone: one(zones, {
    fields: [oauthTokens.zoneId],
    references: [zones.id],
  }),
}));

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// WhatsApp Message relations
export const whatsappMessagesRelations = relations(whatsappMessages, ({ one }) => ({
  user: one(users, {
    fields: [whatsappMessages.userId],
    references: [users.id],
  }),
}));

// Zone Health Log relations
export const zoneHealthLogsRelations = relations(zoneHealthLogs, ({ one }) => ({
  zone: one(zones, {
    fields: [zoneHealthLogs.zoneId],
    references: [zones.id],
  }),
}));
