import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

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
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiry
      if (response.status === 401 && data.error?.code === "TOKEN_EXPIRED") {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request
          return this.request(endpoint, options);
        }
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Network request failed",
        },
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

      // Refresh failed, clear tokens
      await this.clearTokens();
      return false;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async sendOtp(phoneNumber: string) {
    return this.request<{ messageId: string; expiresIn: number }>(
      "/api/v1/auth/otp/send",
      {
        method: "POST",
        body: JSON.stringify({ phoneNumber: `+91${phoneNumber}` }),
      }
    );
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const response = await this.request<{
      token: string;
      refreshToken: string;
      user: any;
      isNew: boolean;
    }>("/api/v1/auth/otp/verify", {
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

  // User endpoints
  async getMe() {
    return this.request<any>("/api/v1/users/me");
  }

  async updateProfile(data: any) {
    return this.request<any>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getMyStats(period = "week") {
    return this.request<any>(`/api/v1/users/me/stats?period=${period}`);
  }

  async getMyActivities(cursor?: string, limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return this.request<any[]>(`/api/v1/users/me/activities?${params}`);
  }

  // Group endpoints
  async getGroups() {
    return this.request<any[]>("/api/v1/groups");
  }

  async createGroup(data: any) {
    return this.request<any>("/api/v1/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getGroup(id: string) {
    return this.request<any>(`/api/v1/groups/${id}`);
  }

  async joinGroup(id: string, inviteCode?: string) {
    return this.request<any>(`/api/v1/groups/${id}/join`, {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    });
  }

  async leaveGroup(id: string) {
    return this.request<any>(`/api/v1/groups/${id}/leave`, {
      method: "DELETE",
    });
  }

  async getGroupMembers(id: string) {
    return this.request<any[]>(`/api/v1/groups/${id}/members`);
  }

  async getGroupLeaderboard(id: string) {
    return this.request<any[]>(`/api/v1/groups/${id}/leaderboard`);
  }

  // Zone endpoints
  async getZones(params?: { lat?: number; lng?: number; cityId?: string }) {
    const query = new URLSearchParams();
    if (params?.lat) query.set("lat", String(params.lat));
    if (params?.lng) query.set("lng", String(params.lng));
    if (params?.cityId) query.set("city_id", params.cityId);
    return this.request<any[]>(`/api/v1/zones?${query}`);
  }

  async getZone(id: string) {
    return this.request<any>(`/api/v1/zones/${id}`);
  }

  async getZoneLeaderboard(id: string) {
    return this.request<any[]>(`/api/v1/zones/${id}/leaderboard`);
  }

  async getMapData(bbox: string, zoom: number) {
    return this.request<any>(`/api/v1/zones/map-data?bbox=${bbox}&zoom=${zoom}`);
  }

  // Activity endpoints
  async createActivity(data: any) {
    return this.request<any>("/api/v1/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Challenge endpoints
  async getChallenges(status?: string) {
    const params = status ? `?status=${status}` : "";
    return this.request<any[]>(`/api/v1/challenges${params}`);
  }

  async createChallenge(data: any) {
    return this.request<any>("/api/v1/challenges", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async joinChallenge(id: string) {
    return this.request<any>(`/api/v1/challenges/${id}/join`, {
      method: "POST",
    });
  }

  // Integration endpoints
  async getStravaAuthUrl() {
    return this.request<{ authUrl: string }>("/api/v1/integrations/strava/auth");
  }

  async syncStrava() {
    return this.request<{ count: number }>("/api/v1/integrations/strava/sync", {
      method: "POST",
    });
  }

  async getIntegrationStatus() {
    return this.request<any>("/api/v1/integrations/status");
  }
}

export const api = new ApiClient();
