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

interface GroupDetail {
  id: string;
  name: string;
  type: string;
  description: string | null;
  color: string | null;
  motto: string | null;
  memberCount: number;
  maxMembers: number;
  currentWeekAp: number;
  zoneRank: number | null;
  privacy: string;
  inviteCode: string | null;
  competitionRating: number;
  seasonalPoints: number;
}

interface GroupMember {
  id: string;
  userId: string;
  displayName: string;
  role: "owner" | "admin" | "member" | "observer";
  weeklyAp: number;
  currentStreak: number;
}

// Mock data
const MOCK_GROUP: GroupDetail = {
  id: "g1",
  name: "Ironclad Fitness",
  type: "gym",
  description: "The strongest gym group in Kolar Road. We don't just lift, we conquer zones.",
  color: "#22c55e",
  motto: "Lift. Conquer. Repeat.",
  memberCount: 28,
  maxMembers: 50,
  currentWeekAp: 4820,
  zoneRank: 1,
  privacy: "public",
  inviteCode: "IRON2024",
  competitionRating: 1250,
  seasonalPoints: 12400,
};

const MOCK_MEMBERS: GroupMember[] = [
  { id: "m1", userId: "u1", displayName: "Rahul Singh", role: "owner", weeklyAp: 820, currentStreak: 14 },
  { id: "m2", userId: "u2", displayName: "Priya Sharma", role: "admin", weeklyAp: 680, currentStreak: 7 },
  { id: "m3", userId: "u3", displayName: "Vikram Patel", role: "member", weeklyAp: 540, currentStreak: 21 },
  { id: "m4", userId: "u4", displayName: "Ananya Gupta", role: "member", weeklyAp: 420, currentStreak: 3 },
  { id: "m5", userId: "u5", displayName: "Deepak Verma", role: "member", weeklyAp: 380, currentStreak: 5 },
  { id: "m6", userId: "u6", displayName: "Neha Jain", role: "member", weeklyAp: 310, currentStreak: 9 },
  { id: "m7", userId: "u7", displayName: "Arjun Reddy", role: "member", weeklyAp: 280, currentStreak: 2 },
  { id: "m8", userId: "u8", displayName: "Kavita Mishra", role: "member", weeklyAp: 210, currentStreak: 4 },
];

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  owner: { label: "Owner", color: "#f59e0b" },
  admin: { label: "Admin", color: "#3b82f6" },
  member: { label: "Member", color: "#445b41" },
  observer: { label: "Observer", color: "#374d34" },
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<GroupDetail | null>(MOCK_GROUP);
  const [members, setMembers] = useState<GroupMember[]>(MOCK_MEMBERS);
  const [activeSection, setActiveSection] = useState<"members" | "zones" | "stats">("members");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGroupData = useCallback(async (refresh = false) => {
    if (!id) return;
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [groupResult, membersResult] = await Promise.all([
        api.getGroup(id),
        api.getGroupMembers(id),
      ]);

      if (groupResult.success && groupResult.data) {
        setGroup(groupResult.data as GroupDetail);
      }
      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data as GroupMember[]);
      }
    } catch {
      // Keep mock data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroupData();
  }, []);

  const handleShare = async () => {
    if (!group) return;
    try {
      await Share.share({
        message: `Join ${group.name} on FitArena! Use invite code: ${group.inviteCode ?? "N/A"}\n\nDownload: https://fitarena.in`,
      });
    } catch {
      // User cancelled
    }
  };

  const handleLeave = () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave ${group?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            try {
              await api.leaveGroup(id);
              router.back();
            } catch {
              // Handle error
            }
          },
        },
      ]
    );
  };

  if (isLoading && !group) {
    return (
      <SafeAreaView className="flex-1 bg-[#011202] items-center justify-center">
        <ActivityIndicator color="#6bff8f" size="large" />
      </SafeAreaView>
    );
  }

  if (!group) return null;

  const groupColor = group.color ?? "#22c55e";

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
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchGroupData(true)}
            tintColor="#6bff8f"
          />
        }
      >
        {/* Group Hero */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center mb-4">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center border border-[#374d34] mr-4"
              style={{ backgroundColor: `${groupColor}15` }}
            >
              <Text className="text-3xl font-black" style={{ color: groupColor }}>
                {group.name.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#d5f0cd] font-black text-2xl tracking-tight">{group.name}</Text>
              {group.motto ? (
                <Text className="text-[#99b292] text-sm italic mt-0.5">"{group.motto}"</Text>
              ) : null}
            </View>
          </View>

          {group.description ? (
            <Text className="text-[#99b292] text-sm mb-4">{group.description}</Text>
          ) : null}

          {/* Stats Row */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-3 items-center">
              <Text className="text-[#6bff8f] text-xl font-black">
                {group.currentWeekAp.toLocaleString()}
              </Text>
              <Text className="text-[#445b41] text-xs font-bold uppercase tracking-wider">Weekly AP</Text>
            </View>
            <View className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-3 items-center">
              <Text className="text-[#d5f0cd] text-xl font-black">
                {group.memberCount}/{group.maxMembers}
              </Text>
              <Text className="text-[#445b41] text-xs font-bold uppercase tracking-wider">Members</Text>
            </View>
            <View className="flex-1 bg-[#051e06] border border-[#374d34] rounded-xl p-3 items-center">
              <Text className="text-[#f59e0b] text-xl font-black">
                #{group.zoneRank ?? "—"}
              </Text>
              <Text className="text-[#445b41] text-xs font-bold uppercase tracking-wider">Zone Rank</Text>
            </View>
          </View>

          {/* Invite Code */}
          {group.inviteCode ? (
            <View className="bg-[#0f3a11] border border-[#22c55e] rounded-xl p-3 flex-row items-center justify-between">
              <View>
                <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest mb-1">Invite Code</Text>
                <Text className="text-[#6bff8f] font-black text-lg tracking-[4px]">{group.inviteCode}</Text>
              </View>
              <TouchableOpacity onPress={handleShare} className="bg-[#22c55e] px-4 py-2 rounded-lg border border-[#6bff8f]">
                <Text className="text-[#002c0f] font-bold text-sm">Invite</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Section Tabs */}
        <View className="flex-row px-6 mb-4">
          {(["members", "zones", "stats"] as const).map((section) => (
            <TouchableOpacity
              key={section}
              onPress={() => setActiveSection(section)}
              className={`flex-1 py-2.5 rounded-xl mr-2 border ${
                activeSection === section
                  ? "bg-[#0f3a11] border-[#6bff8f]"
                  : "bg-[#051e06] border-[#374d34]"
              }`}
            >
              <Text
                className={`text-center font-bold text-xs uppercase tracking-wider ${
                  activeSection === section ? "text-[#6bff8f]" : "text-[#99b292]"
                }`}
              >
                {section}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Content */}
        <View className="px-6">
          {activeSection === "members" && (
            <View>
              <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">
                Member Leaderboard (This Week)
              </Text>
              {members
                .sort((a, b) => b.weeklyAp - a.weeklyAp)
                .map((member, index) => {
                  const role = ROLE_BADGE[member.role] ?? ROLE_BADGE.member;
                  return (
                    <View
                      key={member.id}
                      className="bg-[#0e2c0f] border border-[#374d34] rounded-xl p-3 mb-2 flex-row items-center"
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
                        <View className="flex-row items-center gap-2">
                          <Text className="text-[#d5f0cd] font-semibold" numberOfLines={1}>
                            {member.displayName}
                          </Text>
                          {member.role !== "member" && (
                            <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: `${role.color}20` }}>
                              <Text className="text-[10px] font-bold" style={{ color: role.color }}>
                                {role.label}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-[#445b41] text-xs">
                          {member.currentStreak > 0 ? `🔥 ${member.currentStreak} day streak` : "No streak"}
                        </Text>
                      </View>
                      <Text className="text-[#6bff8f] font-bold">{member.weeklyAp} AP</Text>
                    </View>
                  );
                })}
            </View>
          )}

          {activeSection === "zones" && (
            <View className="items-center py-10">
              <Text className="text-4xl mb-3">🗺️</Text>
              <Text className="text-[#d5f0cd] font-bold text-lg mb-1">Zone Control</Text>
              <Text className="text-[#99b292] text-sm text-center">
                This group controls zones based on weekly AP. Check the map for territory details.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/map")}
                className="bg-[#22c55e] border border-[#6bff8f] px-6 py-3 rounded-xl mt-4"
              >
                <Text className="text-[#002c0f] font-bold">View on Map</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeSection === "stats" && (
            <View className="gap-3">
              <StatRow label="Competition Rating" value={group.competitionRating.toString()} />
              <StatRow label="Seasonal Points" value={group.seasonalPoints.toLocaleString()} />
              <StatRow label="Avg AP / Member" value={Math.round(group.currentWeekAp / Math.max(group.memberCount, 1)).toString()} />
              <StatRow label="Group Type" value={group.type.charAt(0).toUpperCase() + group.type.slice(1)} />
              <StatRow label="Privacy" value={group.privacy.charAt(0).toUpperCase() + group.privacy.slice(1)} />
            </View>
          )}
        </View>

        {/* Leave Group */}
        <View className="px-6 mt-8 mb-10">
          <TouchableOpacity
            onPress={handleLeave}
            className="py-3 border border-red-900 rounded-xl items-center"
          >
            <Text className="text-red-500 font-medium">Leave Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-[#051e06] border border-[#374d34] rounded-xl p-3 flex-row items-center justify-between">
      <Text className="text-[#99b292] text-sm font-medium">{label}</Text>
      <Text className="text-[#d5f0cd] font-bold">{value}</Text>
    </View>
  );
}
