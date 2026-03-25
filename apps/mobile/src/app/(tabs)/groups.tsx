import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { api } from "../../lib/api";

interface GroupSummary {
  id: string;
  name: string;
  type: "open" | "invite" | "gym" | "club" | "coach";
  memberCount: number;
  currentWeekAp: number;
  zoneRank: number | null;
  color: string | null;
  privacy: "public" | "unlisted" | "private";
}

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "#22c55e" },
  invite: { label: "Invite", color: "#f59e0b" },
  gym: { label: "Gym", color: "#3b82f6" },
  club: { label: "Club", color: "#a855f7" },
  coach: { label: "Coach", color: "#ec4899" },
};

// Mock data for when API isn't available yet
const MOCK_MY_GROUPS: GroupSummary[] = [
  { id: "g1", name: "Ironclad Fitness", type: "gym", memberCount: 28, currentWeekAp: 4820, zoneRank: 1, color: "#22c55e", privacy: "public" },
  { id: "g2", name: "Bhopal Runners", type: "club", memberCount: 45, currentWeekAp: 3650, zoneRank: 2, color: "#3b82f6", privacy: "public" },
  { id: "g3", name: "College Fitness Club", type: "open", memberCount: 12, currentWeekAp: 1820, zoneRank: 5, color: "#a855f7", privacy: "public" },
];

const MOCK_DISCOVER: GroupSummary[] = [
  { id: "g4", name: "Iron Paradise", type: "gym", memberCount: 35, currentWeekAp: 6200, zoneRank: 1, color: "#f59e0b", privacy: "public" },
  { id: "g5", name: "Morning Walkers", type: "open", memberCount: 20, currentWeekAp: 980, zoneRank: 3, color: "#445b41", privacy: "public" },
  { id: "g6", name: "CrossFit Central", type: "club", memberCount: 18, currentWeekAp: 3100, zoneRank: 2, color: "#ec4899", privacy: "public" },
];

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [myGroups, setMyGroups] = useState<GroupSummary[]>(MOCK_MY_GROUPS);
  const [discoverGroups, setDiscoverGroups] = useState<GroupSummary[]>(MOCK_DISCOVER);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGroups = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await api.getGroups();
      if (result.success && result.data) {
        setMyGroups(result.data as GroupSummary[]);
      }
    } catch {
      // Keep mock data on failure
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredMyGroups = myGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDiscover = discoverGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#011202]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-black text-[#d5f0cd] tracking-tight">Groups</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-group")}
          className="bg-[#22c55e] px-4 py-2 rounded-xl border border-[#6bff8f]"
        >
          <Text className="text-[#002c0f] font-bold text-sm">+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-6 pb-4">
        <View className="flex-row items-center bg-[#051e06] border border-[#374d34] rounded-xl px-4 py-3">
          <Text className="text-[#445b41] mr-2">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search groups..."
            placeholderTextColor="#445b41"
            className="flex-1 text-[#d5f0cd] text-base"
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("my")}
          className={`flex-1 py-3 rounded-xl mr-2 border ${
            activeTab === "my"
              ? "bg-[#0f3a11] border-[#6bff8f]"
              : "bg-[#051e06] border-[#374d34]"
          }`}
        >
          <Text
            className={`text-center font-bold text-sm ${
              activeTab === "my" ? "text-[#6bff8f]" : "text-[#99b292]"
            }`}
          >
            My Groups ({myGroups.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("discover")}
          className={`flex-1 py-3 rounded-xl border ${
            activeTab === "discover"
              ? "bg-[#0f3a11] border-[#6bff8f]"
              : "bg-[#051e06] border-[#374d34]"
          }`}
        >
          <Text
            className={`text-center font-bold text-sm ${
              activeTab === "discover" ? "text-[#6bff8f]" : "text-[#99b292]"
            }`}
          >
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchGroups(true)}
            tintColor="#6bff8f"
          />
        }
      >
        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#6bff8f" size="large" />
          </View>
        ) : activeTab === "my" ? (
          <>
            {filteredMyGroups.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-4xl mb-3">👥</Text>
                <Text className="text-[#d5f0cd] font-bold text-lg mb-1">No groups yet</Text>
                <Text className="text-[#99b292] text-sm text-center mb-4">
                  Join or create a group to start competing for territory
                </Text>
                <TouchableOpacity
                  onPress={() => setActiveTab("discover")}
                  className="bg-[#22c55e] border border-[#6bff8f] px-6 py-3 rounded-xl"
                >
                  <Text className="text-[#002c0f] font-bold">Discover Groups</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredMyGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))
            )}

            {/* Join via Invite Code */}
            <TouchableOpacity
              onPress={() => router.push("/join-group")}
              className="flex-row items-center justify-center py-4 border border-dashed border-[#374d34] rounded-xl mt-2 mb-6"
            >
              <Text className="text-[#99b292] font-medium">Have an invite code? Join here</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">
              Nearby Groups
            </Text>
            {filteredDiscover.length === 0 ? (
              <Text className="text-[#445b41] text-sm py-4">No groups found matching "{searchQuery}"</Text>
            ) : (
              filteredDiscover.map((group) => (
                <DiscoverCard key={group.id} group={group} />
              ))
            )}
          </>
        )}

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

function GroupCard({ group }: { group: GroupSummary }) {
  const badge = TYPE_BADGE[group.type] ?? TYPE_BADGE.open;
  const groupColor = group.color ?? "#22c55e";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/group/${group.id}`)}
      className="bg-[#0e2c0f] border border-[#374d34] rounded-xl p-4 mb-3"
    >
      <View className="flex-row items-center">
        {/* Group Icon */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center border border-[#374d34] mr-3"
          style={{ backgroundColor: `${groupColor}15` }}
        >
          <Text className="text-xl font-black" style={{ color: groupColor }}>
            {group.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-[#d5f0cd] font-bold text-base" numberOfLines={1}>
              {group.name}
            </Text>
            <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: `${badge.color}20` }}>
              <Text className="text-xs font-bold" style={{ color: badge.color }}>
                {badge.label}
              </Text>
            </View>
          </View>
          <Text className="text-[#99b292] text-sm">
            {group.memberCount} members{group.zoneRank ? ` · #${group.zoneRank} in zone` : ""}
          </Text>
        </View>

        {/* Weekly AP */}
        <View className="items-end">
          <Text className="text-[#6bff8f] font-black text-lg">
            {group.currentWeekAp.toLocaleString()}
          </Text>
          <Text className="text-[#445b41] text-xs font-bold">AP</Text>
        </View>
      </View>

      {/* AP Progress Bar */}
      <View className="mt-3">
        <View className="h-1.5 bg-[#051e06] rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min((group.currentWeekAp / 10000) * 100, 100)}%`,
              backgroundColor: groupColor,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DiscoverCard({ group }: { group: GroupSummary }) {
  const badge = TYPE_BADGE[group.type] ?? TYPE_BADGE.open;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/group/${group.id}`)}
      className="bg-[#0e2c0f] border border-[#374d34] rounded-xl p-4 mb-3 flex-row items-center"
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center border border-[#374d34] mr-3"
        style={{ backgroundColor: `${group.color ?? "#445b41"}15` }}
      >
        <Text className="font-bold" style={{ color: group.color ?? "#445b41" }}>
          {group.name.charAt(0)}
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className="text-[#d5f0cd] font-bold" numberOfLines={1}>{group.name}</Text>
          <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: `${badge.color}20` }}>
            <Text className="text-[10px] font-bold" style={{ color: badge.color }}>{badge.label}</Text>
          </View>
        </View>
        <Text className="text-[#99b292] text-xs">
          {group.memberCount} members · {group.currentWeekAp.toLocaleString()} AP
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push(`/group/${group.id}`)}
        className="px-4 py-2 bg-[#22c55e] rounded-lg border border-[#6bff8f]"
      >
        <Text className="text-[#002c0f] font-bold text-sm">View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
