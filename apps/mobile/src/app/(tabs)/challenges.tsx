import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { api } from "../../lib/api";

type ChallengeType = "group" | "versus" | "zone" | "coach" | "stake";
type ChallengeStatus = "pending" | "active" | "completed" | "cancelled";
type TargetType = "ap_total" | "activity_count" | "streak" | "distance" | "custom";

interface Challenge {
  id: string;
  name: string;
  type: ChallengeType;
  status: ChallengeStatus;
  targetType: TargetType;
  targetValue: number;
  durationDays: number;
  startsAt: string;
  endsAt: string;
  stakeAmount: number | null;
  participantCount: number;
  userProgress: number | null;
  userTargetMet: boolean;
}

const TYPE_CONFIG: Record<ChallengeType, { emoji: string; label: string; color: string }> = {
  group: { emoji: "👥", label: "Group", color: "#3b82f6" },
  versus: { emoji: "⚔️", label: "Versus", color: "#ef4444" },
  zone: { emoji: "🗺️", label: "Zone", color: "#22c55e" },
  coach: { emoji: "🎯", label: "Coach", color: "#a855f7" },
  stake: { emoji: "💰", label: "Stake", color: "#f59e0b" },
};

const TARGET_LABELS: Record<TargetType, string> = {
  ap_total: "AP",
  activity_count: "Activities",
  streak: "Day Streak",
  distance: "km",
  custom: "Target",
};

// Mock data
const MOCK_ACTIVE: Challenge[] = [
  {
    id: "c1", name: "4 Workouts This Week", type: "group", status: "active",
    targetType: "activity_count", targetValue: 4, durationDays: 7,
    startsAt: "2026-03-20T00:00:00Z", endsAt: "2026-03-27T00:00:00Z",
    stakeAmount: null, participantCount: 8, userProgress: 3, userTargetMet: false,
  },
  {
    id: "c2", name: "March AP Blitz", type: "zone", status: "active",
    targetType: "ap_total", targetValue: 500, durationDays: 30,
    startsAt: "2026-03-01T00:00:00Z", endsAt: "2026-03-31T00:00:00Z",
    stakeAmount: null, participantCount: 45, userProgress: 320, userTargetMet: false,
  },
  {
    id: "c3", name: "Weekend Warrior", type: "versus", status: "pending",
    targetType: "ap_total", targetValue: 200, durationDays: 2,
    startsAt: "2026-03-29T00:00:00Z", endsAt: "2026-03-31T00:00:00Z",
    stakeAmount: null, participantCount: 2, userProgress: null, userTargetMet: false,
  },
  {
    id: "c4", name: "Iron Stakes", type: "stake", status: "active",
    targetType: "ap_total", targetValue: 300, durationDays: 7,
    startsAt: "2026-03-20T00:00:00Z", endsAt: "2026-03-27T00:00:00Z",
    stakeAmount: 50000, participantCount: 6, userProgress: 180, userTargetMet: false,
  },
];

const MOCK_COMPLETED: Challenge[] = [
  {
    id: "c5", name: "February Fitness", type: "zone", status: "completed",
    targetType: "ap_total", targetValue: 1000, durationDays: 28,
    startsAt: "2026-02-01T00:00:00Z", endsAt: "2026-02-28T00:00:00Z",
    stakeAmount: null, participantCount: 120, userProgress: 1050, userTargetMet: true,
  },
  {
    id: "c6", name: "5-Day Streak Battle", type: "versus", status: "completed",
    targetType: "streak", targetValue: 5, durationDays: 7,
    startsAt: "2026-03-10T00:00:00Z", endsAt: "2026-03-17T00:00:00Z",
    stakeAmount: null, participantCount: 2, userProgress: 5, userTargetMet: true,
  },
];

function getTimeRemaining(endsAt: string): string {
  const now = new Date();
  const end = new Date(endsAt);
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return "Ended";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

function formatStake(paise: number): string {
  return `₹${(paise / 100).toLocaleString()}`;
}

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_ACTIVE);
  const [completed, setCompleted] = useState<Challenge[]>(MOCK_COMPLETED);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChallenges = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [activeResult, completedResult] = await Promise.all([
        api.getChallenges("active"),
        api.getChallenges("completed"),
      ]);

      if (activeResult.success && activeResult.data) {
        setChallenges(activeResult.data as Challenge[]);
      }
      if (completedResult.success && completedResult.data) {
        setCompleted(completedResult.data as Challenge[]);
      }
    } catch {
      // Keep mock data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#011202]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-black text-[#d5f0cd] tracking-tight">Battles</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-challenge")}
          className="bg-[#22c55e] px-4 py-2 rounded-xl border border-[#6bff8f]"
        >
          <Text className="text-[#002c0f] font-bold text-sm">+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 py-3">
        <TouchableOpacity
          onPress={() => setActiveTab("active")}
          className={`flex-1 py-3 rounded-xl mr-2 border ${
            activeTab === "active" ? "bg-[#0f3a11] border-[#6bff8f]" : "bg-[#051e06] border-[#374d34]"
          }`}
        >
          <Text className={`text-center font-bold text-sm ${activeTab === "active" ? "text-[#6bff8f]" : "text-[#99b292]"}`}>
            Active ({challenges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("completed")}
          className={`flex-1 py-3 rounded-xl border ${
            activeTab === "completed" ? "bg-[#0f3a11] border-[#6bff8f]" : "bg-[#051e06] border-[#374d34]"
          }`}
        >
          <Text className={`text-center font-bold text-sm ${activeTab === "completed" ? "text-[#6bff8f]" : "text-[#99b292]"}`}>
            Completed ({completed.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchChallenges(true)} tintColor="#6bff8f" />
        }
      >
        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#6bff8f" size="large" />
          </View>
        ) : activeTab === "active" ? (
          <>
            {challenges.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-4xl mb-3">⚔️</Text>
                <Text className="text-[#d5f0cd] font-bold text-lg mb-1">No active battles</Text>
                <Text className="text-[#99b292] text-sm text-center mb-4">
                  Create or join a challenge to compete
                </Text>
              </View>
            ) : (
              challenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)
            )}

            {/* Quick Challenges */}
            <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mt-4 mb-3">
              Quick Start
            </Text>
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => router.push("/create-challenge")}
                className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-4 items-center"
              >
                <Text className="text-2xl mb-2">🏃</Text>
                <Text className="text-[#d5f0cd] font-bold text-sm">Weekend Sprint</Text>
                <Text className="text-[#445b41] text-xs">2 days · AP target</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/create-challenge")}
                className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-4 items-center"
              >
                <Text className="text-2xl mb-2">🔥</Text>
                <Text className="text-[#d5f0cd] font-bold text-sm">7-Day Streak</Text>
                <Text className="text-[#445b41] text-xs">7 days · Streak</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {completed.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-[#99b292] text-sm">No completed challenges yet</Text>
              </View>
            ) : (
              completed.map((c) => <CompletedCard key={c.id} challenge={c} />)
            )}
          </>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const config = TYPE_CONFIG[challenge.type];
  const progressPct = challenge.userProgress !== null && challenge.targetValue > 0
    ? Math.min((challenge.userProgress / challenge.targetValue) * 100, 100)
    : 0;
  const isPending = challenge.status === "pending";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/challenge/${challenge.id}`)}
      className="bg-[#0e2c0f] border border-[#374d34] rounded-xl p-4 mb-3"
    >
      {/* Top row: badges + time */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="px-2 py-1 rounded-md" style={{ backgroundColor: `${config.color}20` }}>
            <Text className="text-xs font-bold" style={{ color: config.color }}>
              {config.emoji} {config.label}
            </Text>
          </View>
          {challenge.stakeAmount ? (
            <View className="px-2 py-1 rounded-md bg-[#f59e0b]/20">
              <Text className="text-xs font-bold text-[#f59e0b]">
                {formatStake(challenge.stakeAmount)}
              </Text>
            </View>
          ) : null}
          {isPending && (
            <View className="px-2 py-1 rounded-md bg-[#445b41]/30">
              <Text className="text-xs font-bold text-[#99b292]">Upcoming</Text>
            </View>
          )}
        </View>
        <Text className="text-[#445b41] text-xs font-medium">
          {isPending ? `Starts ${getTimeRemaining(challenge.startsAt).replace(" left", "")}` : getTimeRemaining(challenge.endsAt)}
        </Text>
      </View>

      {/* Title */}
      <Text className="text-[#d5f0cd] font-bold text-lg mb-1">{challenge.name}</Text>
      <Text className="text-[#99b292] text-xs mb-3">
        {challenge.participantCount} participants · Target: {challenge.targetValue} {TARGET_LABELS[challenge.targetType]}
      </Text>

      {/* Progress (only for active with user progress) */}
      {!isPending && challenge.userProgress !== null && (
        <View>
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[#99b292] text-xs font-medium">Your progress</Text>
            <Text className="text-[#6bff8f] font-bold text-sm">
              {challenge.userProgress}/{challenge.targetValue}
            </Text>
          </View>
          <View className="h-2 bg-[#051e06] rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${progressPct}%`, backgroundColor: config.color }}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

function CompletedCard({ challenge }: { challenge: Challenge }) {
  const config = TYPE_CONFIG[challenge.type];
  const won = challenge.userTargetMet;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/challenge/${challenge.id}`)}
      className="bg-[#0e2c0f] border border-[#374d34] rounded-xl p-4 mb-3 flex-row items-center"
    >
      <View className="flex-1">
        <Text className="text-[#d5f0cd] font-bold text-base mb-1">{challenge.name}</Text>
        <View className="flex-row items-center gap-2">
          <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: `${config.color}20` }}>
            <Text className="text-[10px] font-bold" style={{ color: config.color }}>{config.label}</Text>
          </View>
          <View className={`px-2 py-0.5 rounded-md ${won ? "bg-[#22c55e]/20" : "bg-red-500/20"}`}>
            <Text className={`text-[10px] font-bold ${won ? "text-[#6bff8f]" : "text-red-400"}`}>
              {won ? "Completed" : "Missed"}
            </Text>
          </View>
          <Text className="text-[#445b41] text-xs">{challenge.participantCount} participants</Text>
        </View>
      </View>
      <Text className="text-2xl">{won ? "🏆" : "😔"}</Text>
    </TouchableOpacity>
  );
}
