import * as SecureStore from "expo-secure-store";
import type { ActivityType } from "@fitarena/shared/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// ── Response Types ─────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  level: number;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  onboardingComplete: boolean;
  stravaConnected: boolean;
  homeZoneId: string | null;
}

interface AuthResult {
  token: string;
  refreshToken: string;
  user: UserProfile;
  isNew: boolean;
}

interface ActivitySummary {
  id: string;
  activityType: ActivityType;
  durationSeconds: number;
  distanceMeters: number | null;
  calories: number | null;
  arenaPoints: number;
  source: "strava" | "google_fit" | "terra" | "manual";
  startedAt: string;
  notes: string | null;
  confidenceScore: number | null;
}

interface WeeklyStats {
  totalAp: number;
  activityCount: number;
  totalDurationSeconds: number;
}

interface GroupSummary {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  currentWeekAp: number;
  zoneRank: number | null;
  color: string | null;
  privacy: string;
  inviteCode: string | null;
}

interface GroupDetail extends GroupSummary {
  description: string | null;
  motto: string | null;
  maxMembers: number;
  competitionRating: number;
  seasonalPoints: number;
  ownerId: string;
}

interface GroupMember {
  id: string;
  userId: string;
  displayName: string;
  role: "owner" | "admin" | "member" | "observer";
  weeklyAp: number;
  currentStreak: number;
}

interface ChallengeSummary {
  id: string;
  name: string;
  type: string;
  status: string;
  targetType: string;
  targetValue: number;
  durationDays: number;
  startsAt: string;
  endsAt: string;
  stakeAmount: number | null;
  participantCount: number;
  userProgress: number | null;
  userTargetMet: boolean;
}

interface IntegrationStatus {
  strava: { connected: boolean; tokenStatus: string | null; lastSync: string | null; errorCount: number };
  googleFit: { connected: boolean; tokenStatus: string | null; lastSync: string | null; errorCount: number };
  terra: { connected: boolean; lastSync: string | null };
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
}

interface CreateActivityInput {
  activityType: ActivityType;
  durationSeconds: number;
  distanceMeters?: number;
  calories?: number;
  notes?: string;
  startedAt?: string;
}

interface CreateGroupInput {
  name: string;
  type: string;
  description?: string;
  homeZoneId: string;
  privacy?: string;
}

interface CreateChallengeInput {
  name: string;
  type: string;
  targetType: string;
  targetValue: number;
  durationDays: number;
  startsAt: string;
  stakeAmount?: number;
}

// ── API Client ─────────────────────────────────────────

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async init() {
    this.accessToken = await SecureStore.getItemAsync("accessToken");
    this.refreshToken = await SecureStore.getItemAsync("refreshToken");
  }

  async setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
  }

  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (response.status === 401 && data.error?.code === "TOKEN_EXPIRED") {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request(endpoint, options);
        }
      }

      return data;
    } catch {
      return {
        success: false,
        error: { code: "NETWORK_ERROR", message: "Network request failed" },
      };
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (data.success) {
        await this.setTokens(data.data.token, data.data.refreshToken);
        return true;
      }

      await this.clearTokens();
      return false;
    } catch {
      return false;
    }
  }

  // ── Auth ──────────────────────────────────────────────

  async sendOtp(phoneNumber: string) {
    return this.request<{ messageId: string; expiresIn: number }>(
      "/api/v1/auth/otp/send",
      { method: "POST", body: JSON.stringify({ phoneNumber: `+91${phoneNumber}` }) }
    );
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const response = await this.request<AuthResult>("/api/v1/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumber: `+91${phoneNumber}`, otp }),
    });

    if (response.success && response.data) {
      await this.setTokens(response.data.token, response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    await this.request("/api/v1/auth/logout", { method: "DELETE" });
    await this.clearTokens();
  }

  // ── Users ─────────────────────────────────────────────

  async getMe() {
    return this.request<UserProfile>("/api/v1/users/me");
  }

  async updateProfile(data: Partial<Pick<UserProfile, "displayName" | "homeZoneId">> & { avatar?: string; fitnessType?: string; pinCode?: string }) {
    return this.request<UserProfile>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getMyStats(period = "week") {
    return this.request<WeeklyStats>(`/api/v1/users/me/stats?period=${period}`);
  }

  async getMyActivities(cursor?: string, limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return this.request<ActivitySummary[]>(`/api/v1/users/me/activities?${params}`);
  }

  // ── Groups ────────────────────────────────────────────

  async getGroups() {
    return this.request<GroupSummary[]>("/api/v1/groups");
  }

  async createGroup(data: CreateGroupInput) {
    return this.request<GroupDetail>("/api/v1/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getGroup(id: string) {
    return this.request<GroupDetail>(`/api/v1/groups/${id}`);
  }

  async joinGroup(id: string, inviteCode?: string) {
    return this.request<{ message: string }>(`/api/v1/groups/${id}/join`, {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    });
  }

  async leaveGroup(id: string) {
    return this.request<{ message: string }>(`/api/v1/groups/${id}/leave`, {
      method: "DELETE",
    });
  }

  async getGroupMembers(id: string) {
    return this.request<GroupMember[]>(`/api/v1/groups/${id}/members`);
  }

  async getGroupLeaderboard(id: string) {
    return this.request<LeaderboardEntry[]>(`/api/v1/groups/${id}/leaderboard`);
  }

  // ── Zones ─────────────────────────────────────────────

  async getZones(params?: { lat?: number; lng?: number; cityId?: string }) {
    const query = new URLSearchParams();
    if (params?.lat) query.set("lat", String(params.lat));
    if (params?.lng) query.set("lng", String(params.lng));
    if (params?.cityId) query.set("city_id", params.cityId);
    return this.request<LeaderboardEntry[]>(`/api/v1/zones?${query}`);
  }

  async getZone(id: string) {
    return this.request<{ id: string; name: string; pinCode: string; currentControllerGroupId: string | null }>(`/api/v1/zones/${id}`);
  }

  async getZoneLeaderboard(id: string) {
    return this.request<LeaderboardEntry[]>(`/api/v1/zones/${id}/leaderboard`);
  }

  async getMapData(bbox: string, zoom: number) {
    return this.request<{ type: string; features: unknown[] }>(`/api/v1/zones/map-data?bbox=${bbox}&zoom=${zoom}`);
  }

  // ── Activities ────────────────────────────────────────

  async createActivity(data: CreateActivityInput) {
    return this.request<ActivitySummary>("/api/v1/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ── Challenges ────────────────────────────────────────

  async getChallenges(status?: string) {
    const params = status ? `?status=${status}` : "";
    return this.request<ChallengeSummary[]>(`/api/v1/challenges${params}`);
  }

  async createChallenge(data: CreateChallengeInput) {
    return this.request<ChallengeSummary>("/api/v1/challenges", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async joinChallenge(id: string) {
    return this.request<{ message: string }>(`/api/v1/challenges/${id}/join`, {
      method: "POST",
    });
  }

  // ── Integrations ──────────────────────────────────────

  async getStravaAuthUrl() {
    return this.request<{ authUrl: string }>("/api/v1/integrations/strava/auth");
  }

  async syncStrava() {
    return this.request<{ count: number; message: string }>("/api/v1/integrations/strava/sync", {
      method: "POST",
    });
  }

  async getIntegrationStatus() {
    return this.request<IntegrationStatus>("/api/v1/integrations/status");
  }
}

export const api = new ApiClient();
