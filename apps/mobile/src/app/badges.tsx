import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: "consistency" | "territory" | "social" | "performance" | "seasonal";
  earned: boolean;
  earnedAt: string | null;
  progress: number; // 0-100
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  consistency: { label: "Consistency", color: "#f59e0b" },
  territory: { label: "Territory", color: "#22c55e" },
  social: { label: "Social", color: "#3b82f6" },
  performance: { label: "Performance", color: "#ef4444" },
  seasonal: { label: "Seasonal", color: "#a855f7" },
};

const MOCK_BADGES: Badge[] = [
  // Consistency
  { id: "b1", emoji: "🔥", name: "3-Day Streak", description: "Work out 3 days in a row", category: "consistency", earned: true, earnedAt: "2026-03-15", progress: 100 },
  { id: "b2", emoji: "🔥", name: "7-Day Streak", description: "Work out 7 days in a row", category: "consistency", earned: true, earnedAt: "2026-03-20", progress: 100 },
  { id: "b3", emoji: "🔥", name: "30-Day Streak", description: "Work out 30 days in a row", category: "consistency", earned: false, earnedAt: null, progress: 47 },
  { id: "b4", emoji: "📅", name: "Early Bird", description: "Complete 10 morning workouts", category: "consistency", earned: false, earnedAt: null, progress: 60 },
  // Territory
  { id: "b5", emoji: "🗺️", name: "Zone Claimer", description: "Help your group claim a zone", category: "territory", earned: true, earnedAt: "2026-03-18", progress: 100 },
  { id: "b6", emoji: "🏰", name: "Zone Defender", description: "Hold a zone for 3 consecutive weeks", category: "territory", earned: false, earnedAt: null, progress: 33 },
  { id: "b7", emoji: "🌍", name: "Conqueror", description: "Help claim 5 different zones", category: "territory", earned: false, earnedAt: null, progress: 20 },
  // Social
  { id: "b8", emoji: "👥", name: "Team Player", description: "Join your first group", category: "social", earned: true, earnedAt: "2026-03-10", progress: 100 },
  { id: "b9", emoji: "📣", name: "Recruiter", description: "Invite 5 friends who join", category: "social", earned: false, earnedAt: null, progress: 40 },
  { id: "b10", emoji: "🤝", name: "Challenger", description: "Complete 3 versus challenges", category: "social", earned: false, earnedAt: null, progress: 33 },
  // Performance
  { id: "b11", emoji: "🏃", name: "First Run", description: "Log your first running activity", category: "performance", earned: true, earnedAt: "2026-03-12", progress: 100 },
  { id: "b12", emoji: "🌟", name: "Top 10", description: "Rank in top 10 of any zone leaderboard", category: "performance", earned: true, earnedAt: "2026-03-22", progress: 100 },
  { id: "b13", emoji: "💯", name: "Century", description: "Earn 100 AP in a single activity", category: "performance", earned: false, earnedAt: null, progress: 68 },
  // Seasonal
  { id: "b14", emoji: "🎉", name: "First Blood", description: "Join during launch week (limited edition)", category: "seasonal", earned: true, earnedAt: "2026-03-01", progress: 100 },
  { id: "b15", emoji: "☀️", name: "Summer Warrior", description: "Complete the Summer 2026 challenge", category: "seasonal", earned: false, earnedAt: null, progress: 0 },
];

export default function BadgesScreen() {
  const earned = MOCK_BADGES.filter((b) => b.earned).length;
  const total = MOCK_BADGES.length;
  const categories = [...new Set(MOCK_BADGES.map((b) => b.category))];

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
          <Text className="text-[#99b292] font-semibold text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-[#d5f0cd] font-bold text-lg">Badges</Text>
        <View className="w-16" />
      </View>

      {/* Summary */}
      <View className="mx-6 mb-4 bg-[#0f3a11] border border-[#22c55e] rounded-xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest mb-1">Collected</Text>
          <Text className="text-[#d5f0cd] text-sm">{earned} of {total} badges earned</Text>
        </View>
        <Text className="text-[#6bff8f] text-3xl font-black">
          {Math.round((earned / total) * 100)}%
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {categories.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const badges = MOCK_BADGES.filter((b) => b.category === cat);
          return (
            <View key={cat} className="mb-6">
              <View className="flex-row items-center mb-3">
                <View className="px-2 py-1 rounded-md" style={{ backgroundColor: `${config.color}20` }}>
                  <Text className="text-xs font-bold" style={{ color: config.color }}>{config.label}</Text>
                </View>
                <Text className="text-[#445b41] text-xs ml-2">
                  {badges.filter((b) => b.earned).length}/{badges.length}
                </Text>
              </View>

              {badges.map((badge) => (
                <View
                  key={badge.id}
                  className={`bg-[#0e2c0f] border border-[#374d34] rounded-xl p-3 mb-2 flex-row items-center ${
                    !badge.earned ? "opacity-50" : ""
                  }`}
                >
                  <View className={`w-12 h-12 rounded-xl items-center justify-center border mr-3 ${
                    badge.earned ? "bg-[#0f3a11] border-[#374d34]" : "bg-[#051e06] border-[#1a2e1b]"
                  }`}>
                    <Text className="text-2xl">{badge.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#d5f0cd] font-bold text-sm">{badge.name}</Text>
                    <Text className="text-[#445b41] text-xs">{badge.description}</Text>
                    {!badge.earned && badge.progress > 0 && (
                      <View className="mt-1.5">
                        <View className="h-1.5 bg-[#051e06] rounded-full overflow-hidden">
                          <View
                            className="h-full rounded-full"
                            style={{ width: `${badge.progress}%`, backgroundColor: config.color }}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                  {badge.earned ? (
                    <Text className="text-[#6bff8f] text-xs font-bold">✓</Text>
                  ) : (
                    <Text className="text-[#445b41] text-xs font-bold">{badge.progress}%</Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
