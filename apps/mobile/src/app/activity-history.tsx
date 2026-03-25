import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ACTIVITY_MULTIPLIERS, type ActivityType } from "@fitarena/shared/types";
import { formatDuration, formatDistance } from "@fitarena/shared/utils";
import { api } from "../lib/api";

interface Activity {
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

const ACTIVITY_EMOJI: Record<ActivityType, string> = {
  running_outdoor: "🏃",
  running_treadmill: "🏃‍♂️",
  cycling_outdoor: "🚴",
  cycling_indoor: "🚲",
  swimming: "🏊",
  gym: "🏋️",
  walking: "🚶",
  yoga: "🧘",
  sports: "⚽",
  hiit: "🔥",
  dance: "💃",
  home_workout: "🏠",
  other: "✨",
};

const ACTIVITY_LABEL: Record<ActivityType, string> = {
  running_outdoor: "Outdoor Run",
  running_treadmill: "Treadmill",
  cycling_outdoor: "Outdoor Cycling",
  cycling_indoor: "Indoor Cycling",
  swimming: "Swimming",
  gym: "Gym / Weights",
  walking: "Walking",
  yoga: "Yoga",
  sports: "Sports",
  hiit: "HIIT",
  dance: "Dance",
  home_workout: "Home Workout",
  other: "Other",
};

const SOURCE_BADGE: Record<string, { label: string; color: string }> = {
  strava: { label: "Strava", color: "#FC4C02" },
  google_fit: { label: "Google Fit", color: "#4285F4" },
  terra: { label: "Wearable", color: "#8b5cf6" },
  manual: { label: "Manual", color: "#445b41" },
};

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function ActivityCard({ item }: { item: Activity }) {
  const emoji = ACTIVITY_EMOJI[item.activityType] ?? "✨";
  const label = ACTIVITY_LABEL[item.activityType] ?? "Activity";
  const source = SOURCE_BADGE[item.source] ?? SOURCE_BADGE.manual;

  return (
    <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl p-4 mb-3">
      <View className="flex-row items-start">
        {/* Emoji */}
        <View className="w-12 h-12 bg-[#051e06] rounded-xl items-center justify-center border border-[#374d34] mr-3">
          <Text className="text-2xl">{emoji}</Text>
        </View>

        {/* Details */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[#d5f0cd] font-bold text-base">{label}</Text>
            <Text className="text-[#6bff8f] font-black text-lg">+{item.arenaPoints}</Text>
          </View>

          <View className="flex-row items-center flex-wrap gap-x-3 gap-y-1 mb-2">
            <Text className="text-[#99b292] text-sm">
              {formatDuration(item.durationSeconds)}
            </Text>
            {item.distanceMeters ? (
              <Text className="text-[#99b292] text-sm">
                {formatDistance(item.distanceMeters)}
              </Text>
            ) : null}
            {item.calories ? (
              <Text className="text-[#99b292] text-sm">
                {item.calories} kcal
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center justify-between">
            {/* Source badge */}
            <View
              className="px-2 py-1 rounded-md"
              style={{ backgroundColor: `${source.color}20` }}
            >
              <Text style={{ color: source.color }} className="text-xs font-bold">
                {source.label}
              </Text>
            </View>

            {/* Time */}
            <Text className="text-[#445b41] text-xs">
              {formatRelativeDate(item.startedAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {item.notes ? (
        <View className="mt-3 pt-3 border-t border-[#374d34]">
          <Text className="text-[#99b292] text-sm italic">{item.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ActivityHistoryScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [weeklyAP, setWeeklyAP] = useState(0);

  const fetchActivities = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      setCursor(undefined);
    }

    try {
      const result = await api.getMyActivities(isRefresh ? undefined : cursor);

      if (result.success && result.data) {
        const items = result.data as Activity[];
        if (isRefresh) {
          setActivities(items);
        } else {
          setActivities((prev) => [...prev, ...items]);
        }
        setHasMore(items.length >= 20);
        if (items.length > 0) {
          const lastItem = items[items.length - 1];
          setCursor(lastItem.id);
        }
      }
    } catch {
      // Silent fail — existing data stays
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [cursor]);

  const fetchWeeklyStats = useCallback(async () => {
    try {
      const result = await api.getMyStats("week");
      if (result.success && result.data) {
        setWeeklyAP(result.data.totalAp ?? 0);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchActivities(true);
    fetchWeeklyStats();
  }, []);

  const handleRefresh = () => {
    fetchActivities(true);
    fetchWeeklyStats();
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchActivities(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
          <Text className="text-[#99b292] font-semibold text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-[#d5f0cd] font-bold text-lg">My Activities</Text>
        <TouchableOpacity onPress={() => router.push("/log-activity")} className="py-2 pl-4">
          <Text className="text-[#6bff8f] font-bold text-base">+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Summary */}
      <View className="mx-6 mb-4 bg-[#0f3a11] border border-[#22c55e] rounded-xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest mb-1">
            This Week
          </Text>
          <Text className="text-[#d5f0cd] text-sm">
            {activities.length} activities logged
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest mb-1">
            Total AP
          </Text>
          <Text className="text-[#6bff8f] text-2xl font-black">
            {weeklyAP.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Activity List */}
      {isLoading && activities.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6bff8f" size="large" />
        </View>
      ) : activities.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-5xl mb-4">🏋️</Text>
          <Text className="text-[#d5f0cd] font-bold text-xl text-center mb-2">
            No activities yet
          </Text>
          <Text className="text-[#99b292] text-center text-sm mb-6">
            Log your first workout and start earning Arena Points
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/log-activity")}
            className="bg-[#22c55e] border border-[#6bff8f] px-8 py-3 rounded-xl"
          >
            <Text className="text-[#002c0f] font-bold text-base">Log Activity</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#6bff8f"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            hasMore && activities.length > 0 ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#6bff8f" size="small" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
