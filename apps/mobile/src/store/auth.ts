import { create } from "zustand";
import { api } from "../lib/api";

interface User {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  profilePhotoUrl: string | null;
  level: number;
  xpTotal: number;
  currentStreak: number;
  onboardingComplete: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  
  // Actions
  initialize: () => Promise<void>;
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<{ success: boolean; isNew: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  initialize: async () => {
    try {
      await api.init();
      const response = await api.getMe();
      
      if (response.success && response.data) {
        set({
          isAuthenticated: true,
          user: response.data,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  sendOtp: async (phoneNumber: string) => {
    const response = await api.sendOtp(phoneNumber);
    return response.success;
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    const response = await api.verifyOtp(phoneNumber, otp);
    
    if (response.success && response.data) {
      set({
        isAuthenticated: true,
        user: response.data.user,
      });
      return { success: true, isNew: response.data.isNew };
    }
    
    return { success: false, isNew: false };
  },

  logout: async () => {
    await api.logout();
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  refreshUser: async () => {
    const response = await api.getMe();
    if (response.success && response.data) {
      set({ user: response.data });
    }
  },
}));
