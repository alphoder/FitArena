import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { oauthTokens, users } from "@fitarena/db/schema";
import { config } from "../config";
import { createActivity, isDuplicateActivity } from "./activity";
import { mapStravaActivityType } from "@fitarena/shared";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_OAUTH_BASE = "https://www.strava.com/oauth";

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;
  elapsed_time: number;
  distance: number;
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate: boolean;
  map?: {
    summary_polyline?: string;
  };
  start_latlng?: [number, number];
  trainer: boolean;
  device_name?: string;
  calories?: number;
}

/**
 * Generate Strava OAuth URL
 */
export function getStravaAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: config.strava.clientId,
    redirect_uri: config.strava.redirectUri,
    response_type: "code",
    scope: "read,activity:read_all",
    state: userId, // Pass userId to link tokens on callback
  });

  return `${STRAVA_OAUTH_BASE}/authorize?${params}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeStravaCode(
  code: string,
  userId: string
): Promise<StravaTokenResponse> {
  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: config.strava.clientId,
      client_secret: config.strava.clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Strava token exchange failed: ${error}`);
  }

  const data: StravaTokenResponse = await response.json();

  // Store tokens
  await db
    .insert(oauthTokens)
    .values({
      userId,
      provider: "strava",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(data.expires_at * 1000),
      athleteId: data.athlete.id.toString(),
      tokenStatus: "ACTIVE",
      lastSyncAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [oauthTokens.userId, oauthTokens.provider],
      set: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(data.expires_at * 1000),
        athleteId: data.athlete.id.toString(),
        tokenStatus: "ACTIVE",
        updatedAt: new Date(),
      },
    });

  // Update user's Strava connection status
  await db
    .update(users)
    .set({ stravaConnected: true, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return data;
}

/**
 * Refresh expired Strava token
 */
export async function refreshStravaToken(userId: string): Promise<string | null> {
  const token = await db.query.oauthTokens.findFirst({
    where: and(
      eq(oauthTokens.userId, userId),
      eq(oauthTokens.provider, "strava")
    ),
  });

  if (!token?.refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.strava.clientId,
        client_secret: config.strava.clientSecret,
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data: { access_token: string; refresh_token: string; expires_at: number } =
      await response.json();

    await db
      .update(oauthTokens)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(data.expires_at * 1000),
        tokenStatus: "ACTIVE",
        lastRefreshAt: new Date(),
        errorCount: 0,
        updatedAt: new Date(),
      })
      .where(eq(oauthTokens.id, token.id));

    return data.access_token;
  } catch (error) {
    await db
      .update(oauthTokens)
      .set({
        tokenStatus: "REFRESH_FAILED",
        errorCount: (token.errorCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(oauthTokens.id, token.id));

    return null;
  }
}

/**
 * Get valid access token (refreshing if needed)
 */
export async function getStravaAccessToken(userId: string): Promise<string | null> {
  const token = await db.query.oauthTokens.findFirst({
    where: and(
      eq(oauthTokens.userId, userId),
      eq(oauthTokens.provider, "strava")
    ),
  });

  if (!token) {
    return null;
  }

  // Check if token is expired (with 5 min buffer)
  const isExpired = token.expiresAt && token.expiresAt < new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired) {
    return refreshStravaToken(userId);
  }

  return token.accessToken;
}

/**
 * Fetch activity from Strava
 */
export async function fetchStravaActivity(
  accessToken: string,
  activityId: number
): Promise<StravaActivity | null> {
  const response = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    console.error(`Failed to fetch Strava activity ${activityId}: ${response.status}`);
    return null;
  }

  return response.json();
}

/**
 * Process Strava webhook event
 */
export async function processStravaWebhook(event: {
  object_type: string;
  object_id: number;
  aspect_type: string;
  owner_id: number;
}): Promise<void> {
  if (event.object_type !== "activity" || event.aspect_type === "delete") {
    return;
  }

  // Find user by Strava athlete ID
  const token = await db.query.oauthTokens.findFirst({
    where: and(
      eq(oauthTokens.provider, "strava"),
      eq(oauthTokens.athleteId, event.owner_id.toString())
    ),
  });

  if (!token) {
    console.log(`No user found for Strava athlete ${event.owner_id}`);
    return;
  }

  // Check for duplicate
  if (await isDuplicateActivity(token.userId, "strava", event.object_id.toString())) {
    console.log(`Duplicate activity ${event.object_id} for user ${token.userId}`);
    return;
  }

  // Get access token
  const accessToken = await getStravaAccessToken(token.userId);
  if (!accessToken) {
    console.error(`No valid access token for user ${token.userId}`);
    return;
  }

  // Fetch activity details
  const activity = await fetchStravaActivity(accessToken, event.object_id);
  if (!activity) {
    return;
  }

  // Map activity type
  const activityType = mapStravaActivityType(activity.sport_type);

  // Create activity in our database
  await createActivity({
    userId: token.userId,
    source: "strava",
    sourceActivityId: activity.id.toString(),
    activityType,
    startedAt: new Date(activity.start_date),
    durationSeconds: activity.elapsed_time,
    distanceMeters: Math.round(activity.distance),
    calories: activity.calories,
    avgHeartRate: activity.average_heartrate,
    maxHeartRate: activity.max_heartrate,
    hasGps: !!activity.start_latlng,
    routePolyline: activity.map?.summary_polyline,
    startLat: activity.start_latlng?.[0],
    startLng: activity.start_latlng?.[1],
    rawData: activity,
  });

  // Update last sync time
  await db
    .update(oauthTokens)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(oauthTokens.id, token.id));

  console.log(`Processed Strava activity ${activity.id} for user ${token.userId}`);
}

/**
 * Sync historical activities for a user (last 30 days)
 */
export async function syncStravaHistory(userId: string): Promise<number> {
  const accessToken = await getStravaAccessToken(userId);
  if (!accessToken) {
    throw new Error("No valid Strava access token");
  }

  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?after=${thirtyDaysAgo}&per_page=100`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Strava activities: ${response.status}`);
  }

  const activities: StravaActivity[] = await response.json();
  let count = 0;

  for (const activity of activities) {
    if (await isDuplicateActivity(userId, "strava", activity.id.toString())) {
      continue;
    }

    const activityType = mapStravaActivityType(activity.sport_type);

    await createActivity({
      userId,
      source: "strava",
      sourceActivityId: activity.id.toString(),
      activityType,
      startedAt: new Date(activity.start_date),
      durationSeconds: activity.elapsed_time,
      distanceMeters: Math.round(activity.distance),
      calories: activity.calories,
      avgHeartRate: activity.average_heartrate,
      maxHeartRate: activity.max_heartrate,
      hasGps: !!activity.start_latlng,
      routePolyline: activity.map?.summary_polyline,
      startLat: activity.start_latlng?.[0],
      startLng: activity.start_latlng?.[1],
      rawData: activity,
    });

    count++;
  }

  return count;
}
