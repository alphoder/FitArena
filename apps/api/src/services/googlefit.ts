import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { oauthTokens, users } from "@fitarena/db/schema";
import { config } from "../config";
import { createActivity, isDuplicateActivity } from "./activity";
import { mapGoogleFitActivityType } from "@fitarena/shared";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FITNESS_API = "https://www.googleapis.com/fitness/v1/users/me";

interface GoogleFitSession {
  id: string;
  name: string;
  description: string;
  startTimeMillis: string;
  endTimeMillis: string;
  activityType: number;
  application: { packageName: string };
}

/**
 * Exchange Google authorization code for tokens.
 */
export async function exchangeGoogleFitCode(
  code: string,
  userId: string
): Promise<void> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.googleFit.clientId,
      client_secret: config.googleFit.clientSecret,
      redirect_uri: config.googleFit.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${response.status}`);
  }

  const data: { access_token: string; refresh_token: string; expires_in: number } =
    await response.json();

  await db
    .insert(oauthTokens)
    .values({
      userId,
      provider: "google_fit",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      tokenStatus: "ACTIVE",
      lastSyncAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [oauthTokens.userId, oauthTokens.provider],
      set: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        tokenStatus: "ACTIVE",
        updatedAt: new Date(),
      },
    });

  await db
    .update(users)
    .set({ updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Refresh expired Google Fit token.
 */
async function refreshGoogleFitToken(userId: string): Promise<string | null> {
  const token = await db.query.oauthTokens.findFirst({
    where: and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, "google_fit")),
  });

  if (!token?.refreshToken) return null;

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: token.refreshToken,
        client_id: config.googleFit.clientId,
        client_secret: config.googleFit.clientSecret,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) throw new Error("Refresh failed");

    const data: { access_token: string; expires_in: number } = await response.json();

    await db
      .update(oauthTokens)
      .set({
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        tokenStatus: "ACTIVE",
        lastRefreshAt: new Date(),
        errorCount: 0,
        updatedAt: new Date(),
      })
      .where(eq(oauthTokens.id, token.id));

    return data.access_token;
  } catch {
    await db
      .update(oauthTokens)
      .set({
        tokenStatus: "REFRESH_FAILED",
        errorCount: (token.errorCount ?? 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(oauthTokens.id, token.id));

    return null;
  }
}

/**
 * Get valid access token (refresh if expired).
 */
async function getGoogleFitToken(userId: string): Promise<string | null> {
  const token = await db.query.oauthTokens.findFirst({
    where: and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, "google_fit")),
  });

  if (!token) return null;

  const isExpired = token.expiresAt && token.expiresAt < new Date(Date.now() + 5 * 60 * 1000);
  if (isExpired) return refreshGoogleFitToken(userId);

  return token.accessToken;
}

/**
 * Sync Google Fit sessions for a user (last 7 days by default).
 */
export async function syncGoogleFitActivities(userId: string, daysBack = 7): Promise<number> {
  const accessToken = await getGoogleFitToken(userId);
  if (!accessToken) throw new Error("No valid Google Fit token");

  const startTimeMillis = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const endTimeMillis = Date.now();

  const response = await fetch(
    `${FITNESS_API}/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    throw new Error(`Google Fit API error: ${response.status}`);
  }

  const data: { session: GoogleFitSession[] } = await response.json();
  let count = 0;

  for (const session of data.session ?? []) {
    if (await isDuplicateActivity(userId, "google_fit", session.id)) continue;

    const startMs = parseInt(session.startTimeMillis, 10);
    const endMs = parseInt(session.endTimeMillis, 10);
    const durationSeconds = Math.round((endMs - startMs) / 1000);

    if (durationSeconds < 60) continue; // Skip very short sessions

    const activityType = mapGoogleFitActivityType(session.activityType);

    await createActivity({
      userId,
      source: "google_fit",
      sourceActivityId: session.id,
      activityType,
      startedAt: new Date(startMs),
      durationSeconds,
      hasGps: false, // Google Fit sessions don't include GPS by default
      rawData: session,
    });

    count++;
  }

  // Update last sync time
  await db
    .update(oauthTokens)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(oauthTokens.userId, userId), eq(oauthTokens.provider, "google_fit"))
    );

  return count;
}
