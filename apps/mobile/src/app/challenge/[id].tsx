import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";

type ChallengeType = "group" | "versus" | "zone" | "coach" | "stake";
type TargetType = "ap_total" | "activity_count" | "streak" | "distance" | "custom";

interface ChallengeDetail {
  id: string;
  name: string;
  type: ChallengeType;
  description: string | null;
  status: "pending" | "active" | "completed" | "cancelled";
  targetType: TargetType;
  targetValue: number;
  durationDays: number;
  startsAt: string;
  endsAt: string;
  stakeAmount: number | null;
  platformFeePct: number;
  participantCount: number;
  verificationRequired: boolean;
}

interface Participant {
  userId: string;
  displayName: string;
  progress: number;
  targetMet: boolean;
  stakePaid: boolean;
}

const TYPE_CONFIG: Record<ChallengeType, { emoji: string; label: string; color: string }> = {
  group: { emoji: "👥", label: "Group", color: "#3b82f6" },
  versus: { emoji: "⚔️", label: "Versus", color: "#ef4444" },
  zone: { emoji: "🗺️", label: "Zone", color: "#22c55e" },
  coach: { emoji: "🎯", label: "Coach", color: "#a855f7" },
  stake: { emoji: "💰", label: "Stake", color: "#f59e0b" },
};

const TARGET_UNIT: Record<TargetType, string> = {
  ap_total: "AP",
  activity_count: "workouts",
  streak: "day streak",
  distance: "km",
  custom: "target",
};

// Mock data
const MOCK_CHALLENGE: ChallengeDetail = {
  id: "c1",
  name: "4 Workouts This Week",
  type: "group",
  description: "Complete 4 workouts this week to prove you're dedicated. Any activity type counts!",
  status: "active",
  targetType: "activity_count",
  targetValue: 4,
  durationDays: 7,
  startsAt: "2026-03-20T00:00:00Z",
  endsAt: "2026-03-27T00:00:00Z",
  stakeAmount: null,
  platformFeePct: 15,
  participantCount: 8,
  verificationRequired: false,
};

const MOCK_PARTICIPANTS: Participant[] = [
  { userId: "u1", displayName: "Rahul Singh", progress: 4, targetMet: true, stakePaid: false },
  { userId: "u2", displayName: "Priya Sharma", progress: 3, targetMet: false, stakePaid: false },
  { userId: "u3", displayName: "You", progress: 3, targetMet: false, stakePaid: false },
  { userId: "u4", displayName: "Vikram Patel", progress: 2, targetMet: false, stakePaid: false },
  { userId: "u5", displayName: "Ananya Gupta", progress: 2, targetMet: false, stakePaid: false },
  { userId: "u6", displayName: "Deepak Verma", progress: 1, targetMet: false, stakePaid: false },
];

function getTimeRemaining(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(MOCK_CHALLENGE);
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(true); // Mock: already joined

  const fetchData = useCallback(async (refresh = false) => {
    if (!id) return;
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await api.request<ChallengeDetail>(`/api/v1/challenges/${id}`);
      if (result.success && result.data) {
        setChallenge(result.data);
      }

      const lbResult = await api.request<Participant[]>(`/api/v1/challenges/${id}/leaderboard`);
      if (lbResult.success && lbResult.data) {
        setParticipants(lbResult.data);
      }
    } catch {
      // Keep mock data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async () => {
    if (!id) return;

    if (challenge?.stakeAmount) {
      Alert.alert(
        "Join Stake Challenge",
        `This challenge requires a stake of ₹${(challenge.stakeAmount / 100).toLocaleString()}. Proceed?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Join & Pay", onPress: () => joinChallenge() },
        ]
      );
    } else {
      joinChallenge();
    }
  };

  const joinChallenge = async () => {
    if (!id) return;
    setIsJoining(true);
    try {
      const result = await api.joinChallenge(id);
      if (result.success) {
        setHasJoined(true);
        fetchData(true);
      }
    } catch {
      // Handle error
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = async () => {
    if (!challenge) return;
    try {
      await Share.share({
        message: `Join "${challenge.name}" on FitArena! ${challenge.targetValue} ${TARGET_UNIT[challenge.targetType]} in ${challenge.durationDays} days. Can you do it?\n\nhttps://fitarena.in/challenge/${challenge.id}`,
      });
    } catch {
      // Cancelled
    }
  };

  if (isLoading && !challenge) {
    return (
      <SafeAreaView className="flex-1 bg-[#011202] items-center justify-center">
        <ActivityIndicator color="#6bff8f" size="large" />
      </SafeAreaView>
    );
  }

  if (!challenge) return null;

  const config = TYPE_CONFIG[challenge.type];
  const userParticipant = participants.find((p) => p.displayName === "You");
  const userProgress = userParticipant?.progress ?? 0;
  const progressPct = Math.min((userProgress / challenge.targetValue) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
          <Text className="text-[#99b292] font-semibold text-base">← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} className="py-2 pl-4">
          <Text className="text-[#6bff8f] font-bold text-base">Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchData(true)} tintColor="#6bff8f" />
        }
      >
        {/* Hero */}
        <View className="px-6 pb-6">
          {/* Type + Status badges */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
              <Text className="font-bold text-sm" style={{ color: config.color }}>
                {config.emoji} {config.label}
              </Text>
            </View>
            <View className={`px-3 py-1.5 rounded-lg ${
              challenge.status === "active" ? "bg-[#22c55e]/20" :
              challenge.status === "pending" ? "bg-[#f59e0b]/20" :
              "bg-[#445b41]/20"
            }`}>
              <Text className={`font-bold text-sm capitalize ${
                challenge.status === "active" ? "text-[#6bff8f]" :
                challenge.status === "pending" ? "text-[#f59e0b]" :
                "text-[#99b292]"
              }`}>
                {challenge.status}
              </Text>
            </View>
            {challenge.stakeAmount ? (
              <View className="px-3 py-1.5 rounded-lg bg-[#f59e0b]/20">
                <Text className="font-bold text-sm text-[#f59e0b]">
                  ₹{(challenge.stakeAmount / 100).toLocaleString()}
                </Text>
              </View>
            ) : null}
          </View>

          <Text className="text-[#d5f0cd] font-black text-2xl tracking-tight mb-2">
            {challenge.name}
          </Text>

          {challenge.description ? (
            <Text className="text-[#99b292] text-sm mb-4">{challenge.description}</Text>
          ) : null}

          {/* Time remaining */}
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl p-3 mb-4">
            <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest text-center">
              {challenge.status === "active" ? getTimeRemaining(challenge.endsAt) : challenge.status === "pending" ? `Starts ${getTimeRemaining(challenge.startsAt)}` : "Challenge ended"}
            </Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-3 items-center">
              <Text className="text-[#6bff8f] text-xl font-black">{challenge.targetValue}</Text>
              <Text className="text-[#445b41] text-xs font-bold uppercase">{TARGET_UNIT[challenge.targetType]}</Text>
            </View>
            <View className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-3 items-center">
              <Text className="text-[#d5f0cd] text-xl font-black">{challenge.durationDays}d</Text>
              <Text className="text-[#445b41] text-xs font-bold uppercase">Duration</Text>
            </View>
            <View className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-3 items-center">
              <Text className="text-[#d5f0cd] text-xl font-black">{challenge.participantCount}</Text>
              <Text className="text-[#445b41] text-xs font-bold uppercase">Joined</Text>
            </View>
          </View>

          {/* Your Progress */}
          {hasJoined && challenge.status === "active" && (
            <View className="bg-[#0f3a11] border border-[#22c55e] rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest">Your Progress</Text>
                <Text className="text-[#6bff8f] font-black text-lg">
                  {userProgress}/{challenge.targetValue}
                </Text>
              </View>
              <View className="h-3 bg-[#051e06] rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full bg-[#22c55e]"
                  style={{ width: `${progressPct}%` }}
                />
              </View>
              {userParticipant?.targetMet && (
                <Text className="text-[#6bff8f] text-sm font-bold mt-2 text-center">
                  🎉 Target reached!
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Leaderboard */}
        <View className="px-6">
          <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">
            Leaderboard
          </Text>
          {participants
            .sort((a, b) => b.progress - a.progress)
            .map((p, index) => (
              <View
                key={p.userId}
                className={`bg-[#0e2c0f] border rounded-xl p-3 mb-2 flex-row items-center ${
                  p.displayName === "You" ? "border-[#6bff8f]" : "border-[#374d34]"
                }`}
              >
                <Text
                  className={`w-8 font-black text-center ${
                    index === 0 ? "text-[#f59e0b] text-lg" :
                    index === 1 ? "text-[#94a3b8] text-base" :
                    index === 2 ? "text-[#b45309] text-base" :
                    "text-[#445b41] text-sm"
                  }`}
                >
                  #{index + 1}
                </Text>
                <View className="flex-1 ml-2">
                  <Text className={`font-semibold ${p.displayName === "You" ? "text-[#6bff8f]" : "text-[#d5f0cd]"}`}>
                    {p.displayName}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#6bff8f] font-bold">
                    {p.progress}/{challenge.targetValue}
                  </Text>
                  {p.targetMet && <Text className="text-[10px] text-[#22c55e]">✓ Done</Text>}
                </View>
              </View>
            ))}
        </View>

        {/* Join / Action Button */}
        <View className="px-6 mt-6 mb-10">
          {!hasJoined ? (
            <TouchableOpacity
              onPress={handleJoin}
              disabled={isJoining}
              className="py-4 bg-[#22c55e] border border-[#6bff8f] rounded-xl items-center"
            >
              {isJoining ? (
                <ActivityIndicator color="#002c0f" />
              ) : (
                <Text className="text-[#002c0f] font-bold text-lg">
                  {challenge.stakeAmount ? `Join & Stake ₹${(challenge.stakeAmount / 100).toLocaleString()}` : "Join Challenge"}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/log-activity")}
              className="py-4 bg-[#22c55e] border border-[#6bff8f] rounded-xl items-center"
            >
              <Text className="text-[#002c0f] font-bold text-lg">Log Activity</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
