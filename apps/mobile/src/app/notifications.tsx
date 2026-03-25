import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  type: "territory" | "challenge" | "group" | "streak" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: { route?: string; id?: string };
}

const TYPE_CONFIG: Record<string, { emoji: string; color: string }> = {
  territory: { emoji: "🗺️", color: "#22c55e" },
  challenge: { emoji: "⚔️", color: "#ef4444" },
  group: { emoji: "👥", color: "#3b82f6" },
  streak: { emoji: "🔥", color: "#f59e0b" },
  system: { emoji: "📢", color: "#99b292" },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "territory", title: "Territory Conquered! 🏆",
    body: "Ironclad Fitness now controls Kolar Road!", read: false,
    createdAt: "2026-03-25T08:00:00Z", data: { route: "/(tabs)/map" },
  },
  {
    id: "n2", type: "challenge", title: "Challenge Update",
    body: "You're #2 in '4 Workouts This Week' — 1 more to win!", read: false,
    createdAt: "2026-03-25T06:30:00Z", data: { route: "/challenge/c1", id: "c1" },
  },
  {
    id: "n3", type: "streak", title: "Streak Alert 🔥",
    body: "Your 7-day streak is at risk! Log an activity today.", read: true,
    createdAt: "2026-03-24T18:00:00Z",
  },
  {
    id: "n4", type: "group", title: "New Member Joined",
    body: "Ananya Gupta joined Ironclad Fitness", read: true,
    createdAt: "2026-03-24T14:00:00Z", data: { route: "/group/g1", id: "g1" },
  },
  {
    id: "n5", type: "territory", title: "Zone Under Attack!",
    body: "Urban Athletes are closing in on Kolar Road (gap: 12%)", read: true,
    createdAt: "2026-03-24T10:00:00Z", data: { route: "/(tabs)/map" },
  },
  {
    id: "n6", type: "system", title: "Welcome to FitArena",
    body: "Connect a tracker to earn up to 1.0x Arena Points", read: true,
    createdAt: "2026-03-23T12:00:00Z", data: { route: "/connect-tracker" },
  },
];

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTap = (notif: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    // Navigate if route exists
    if (notif.data?.route) {
      router.push(notif.data.route as never);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
          <Text className="text-[#99b292] font-semibold text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-[#d5f0cd] font-bold text-lg">
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} className="py-2 pl-4">
            <Text className="text-[#6bff8f] text-sm font-bold">Read All</Text>
          </TouchableOpacity>
        ) : (
          <View className="w-16" />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#6bff8f" />
        }
        renderItem={({ item }) => {
          const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;
          return (
            <TouchableOpacity
              onPress={() => handleTap(item)}
              className={`px-6 py-4 border-b border-[#1a2e1b] flex-row ${
                !item.read ? "bg-[#0f3a11]/30" : ""
              }`}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center border border-[#374d34] mr-3"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Text className="text-lg">{config.emoji}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text className={`font-bold text-sm ${!item.read ? "text-[#d5f0cd]" : "text-[#99b292]"}`}>
                    {item.title}
                  </Text>
                  <Text className="text-[#445b41] text-xs">{formatTime(item.createdAt)}</Text>
                </View>
                <Text className={`text-sm ${!item.read ? "text-[#99b292]" : "text-[#445b41]"}`}>
                  {item.body}
                </Text>
              </View>
              {!item.read && (
                <View className="w-2.5 h-2.5 rounded-full bg-[#6bff8f] ml-2 mt-1.5" />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-4xl mb-3">🔔</Text>
            <Text className="text-[#d5f0cd] font-bold text-lg mb-1">All caught up</Text>
            <Text className="text-[#99b292] text-sm">No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
