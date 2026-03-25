import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { api } from "../../lib/api";

interface WeeklyStats {
  totalAp: number;
  activityCount: number;
  totalDurationSeconds: number;
}

// XP Level thresholds from PRD
const LEVELS = [
  { level: 1, name: "Newcomer", xp: 0 },
  { level: 2, name: "Regular", xp: 100 },
  { level: 3, name: "Active", xp: 300 },
  { level: 4, name: "Committed", xp: 600 },
  { level: 5, name: "Dedicated", xp: 1000 },
  { level: 6, name: "Warrior", xp: 1500 },
  { level: 7, name: "Champion", xp: 2500 },
  { level: 8, name: "Legend", xp: 4000 },
  { level: 9, name: "Elite", xp: 6000 },
  { level: 10, name: "Apex", xp: 10000 },
];

const MOCK_BADGES = [
  { emoji: "🔥", name: "7-Day Streak", earned: true },
  { emoji: "🏃", name: "First Run", earned: true },
  { emoji: "👥", name: "Team Player", earned: true },
  { emoji: "🌟", name: "Top 10", earned: true },
  { emoji: "🏋️", name: "Iron Will", earned: false },
  { emoji: "🗺️", name: "Zone Conqueror", earned: false },
];

function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? LEVELS[i];
      break;
    }
  }
  const progress = next.xp > current.xp
    ? ((xp - current.xp) / (next.xp - current.xp)) * 100
    : 100;
  return { current, next, progress };
}

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuthStore();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({ totalAp: 680, activityCount: 4, totalDurationSeconds: 7200 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      const result = await api.getMyStats("week");
      if (result.success && result.data) {
        setWeeklyStats(result.data as WeeklyStats);
      }
    } catch {
      // silent
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const xp = user?.xpTotal ?? 0;
  const levelInfo = getLevelInfo(xp);
  const streak = user?.currentStreak ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-[#011202]" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#6bff8f" />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <Text className="text-2xl font-black text-[#d5f0cd] tracking-tight">Profile</Text>
          <TouchableOpacity onPress={() => router.push("/settings")} className="py-2 pl-4">
            <Text className="text-[#99b292] text-sm font-medium">⚙️ Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="px-6 py-4">
          <View className="flex-row items-center mb-4">
            <View className="w-18 h-18 bg-[#0f3a11] border-2 border-[#6bff8f] rounded-2xl items-center justify-center" style={{ width: 72, height: 72 }}>
              <Text className="text-3xl font-black text-[#6bff8f]">
                {user?.displayName?.[0]?.toUpperCase() ?? "U"}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[#d5f0cd] font-black text-xl">
                {user?.displayName ?? "User"}
              </Text>
              <Text className="text-[#99b292] text-sm mt-0.5">
                Level {levelInfo.current.level} · {levelInfo.current.name}
              </Text>
            </View>
          </View>

          {/* XP Progress */}
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl p-3 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#99b292] text-xs font-bold uppercase tracking-widest">Experience</Text>
              <Text className="text-[#6bff8f] text-xs font-bold">
                {xp} / {levelInfo.next.xp} XP
              </Text>
            </View>
            <View className="h-2 bg-[#011202] rounded-full overflow-hidden">
              <View className="h-full bg-[#6bff8f] rounded-full" style={{ width: `${levelInfo.progress}%` }} />
            </View>
            <Text className="text-[#445b41] text-[10px] mt-1.5">
              {levelInfo.next.xp - xp} XP to {levelInfo.next.name}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-6 gap-3 mb-6">
          <View className="flex-1 bg-[#0e2c0f] border border-[#374d34] rounded-xl p-3 items-center">
            <Text className="text-[#6bff8f] text-2xl font-black">{weeklyStats.totalAp}</Text>
            <Text className="text-[#445b41] text-xs font-bold uppercase">Weekly AP</Text>
          </View>
          <View className="flex-1 bg-[#0e2c0f] border border-[#374d34] rounded-xl p-3 items-center">
            <Text className="text-[#d5f0cd] text-2xl font-black">{weeklyStats.activityCount}</Text>
            <Text className="text-[#445b41] text-xs font-bold uppercase">Activities</Text>
          </View>
          <View className="flex-1 bg-[#0e2c0f] border border-[#374d34] rounded-xl p-3 items-center">
            <Text className="text-[#f59e0b] text-2xl font-black">
              {streak > 0 ? `${streak}🔥` : "0"}
            </Text>
            <Text className="text-[#445b41] text-xs font-bold uppercase">Streak</Text>
          </View>
        </View>

        {/* Badges */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-bold text-[#d5f0cd] uppercase tracking-wider">Badges</Text>
            <TouchableOpacity onPress={() => router.push("/badges")}>
              <Text className="text-[#6bff8f] text-sm font-bold">View All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {MOCK_BADGES.map((badge) => (
                <View
                  key={badge.name}
                  className={`items-center w-16 ${!badge.earned ? "opacity-40" : ""}`}
                >
                  <View className={`w-14 h-14 rounded-xl items-center justify-center border ${
                    badge.earned ? "bg-[#0f3a11] border-[#374d34]" : "bg-[#051e06] border-[#1a2e1b]"
                  }`}>
                    <Text className="text-2xl">{badge.emoji}</Text>
                  </View>
                  <Text className="text-[#99b292] text-[10px] text-center mt-1" numberOfLines={1}>
                    {badge.name}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View className="px-6 mb-6">
          <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">Account</Text>
          <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden">
            <MenuItem emoji="📊" label="Activity History" onPress={() => router.push("/activity-history")} />
            <MenuItem emoji="🏆" label="Badges & Achievements" onPress={() => router.push("/badges")} />
            <MenuItem emoji="🔗" label="Connected Apps" onPress={() => router.push("/settings")} />
            <MenuItem emoji="⚙️" label="Settings" onPress={() => router.push("/settings")} last />
          </View>
        </View>

        {/* Logout */}
        <View className="px-6 mb-10">
          <TouchableOpacity
            onPress={handleLogout}
            className="py-3 border border-red-900 rounded-xl items-center"
          >
            <Text className="text-red-500 font-medium">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ emoji, label, onPress, last = false }: {
  emoji: string;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between px-4 py-3.5 ${!last ? "border-b border-[#374d34]" : ""}`}
    >
      <View className="flex-row items-center">
        <Text className="text-base mr-3">{emoji}</Text>
        <Text className="text-[#d5f0cd] font-medium">{label}</Text>
      </View>
      <Text className="text-[#445b41]">→</Text>
    </TouchableOpacity>
  );
}
