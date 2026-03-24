import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Plus, Users, ChevronRight, Trophy } from "lucide-react-native";

// Mock data
const mockGroups = [
  {
    id: "1",
    name: "Ironclad Fitness",
    type: "gym",
    memberCount: 28,
    weeklyAp: 4820,
    zoneRank: 1,
    color: "#22c55e",
  },
  {
    id: "2",
    name: "Bhopal Runners",
    type: "club",
    memberCount: 45,
    weeklyAp: 3650,
    zoneRank: 2,
    color: "#3b82f6",
  },
  {
    id: "3",
    name: "College Fitness Club",
    type: "open",
    memberCount: 12,
    weeklyAp: 1820,
    zoneRank: 5,
    color: "#a855f7",
  },
];

const discoveryGroups = [
  {
    id: "4",
    name: "Iron Paradise",
    type: "gym",
    memberCount: 35,
    zoneRank: 1,
    zone: "MP Nagar",
  },
  {
    id: "5",
    name: "Morning Walkers",
    type: "open",
    memberCount: 20,
    zoneRank: 3,
    zone: "Arera Colony",
  },
];

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Groups</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Search size={20} color="#9ca3af" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search groups..."
            className="flex-1 ml-3 text-gray-900"
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("my")}
          className={`flex-1 py-3 rounded-xl mr-2 ${
            activeTab === "my" ? "bg-green-600" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "my" ? "text-white" : "text-gray-600"
            }`}
          >
            My Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("discover")}
          className={`flex-1 py-3 rounded-xl ${
            activeTab === "discover" ? "bg-green-600" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "discover" ? "text-white" : "text-gray-600"
            }`}
          >
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {activeTab === "my" ? (
          <>
            {/* My Groups List */}
            {mockGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}

            {/* Create Group Button */}
            <TouchableOpacity className="flex-row items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl mt-4 mb-6">
              <Plus size={20} color="#9ca3af" />
              <Text className="ml-2 text-gray-500 font-medium">
                Create New Group
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Nearby Groups */}
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Nearby Groups
            </Text>
            {discoveryGroups.map((group) => (
              <DiscoveryCard key={group.id} group={group} />
            ))}

            {/* Zone Champions */}
            <Text className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Zone Champions
            </Text>
            <View className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <View className="flex-row items-center gap-3">
                <Trophy size={24} color="#f59e0b" />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    Ironclad Fitness
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Controls Vijay Nagar with 4,820 AP
                  </Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GroupCard({ group }: { group: (typeof mockGroups)[0] }) {
  return (
    <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <View className="flex-row items-center gap-3">
        {/* Group Avatar */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: group.color + "20" }}
        >
          <Users size={24} color={group.color} />
        </View>

        {/* Group Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-gray-900">{group.name}</Text>
            <View className="px-2 py-0.5 bg-gray-100 rounded-full">
              <Text className="text-xs text-gray-600 capitalize">
                {group.type}
              </Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm">
            {group.memberCount} members • #{group.zoneRank} in zone
          </Text>
        </View>

        {/* Weekly AP */}
        <View className="items-end">
          <Text className="font-bold text-gray-900">
            {group.weeklyAp.toLocaleString()}
          </Text>
          <Text className="text-gray-500 text-sm">AP</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mt-3">
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min((group.weeklyAp / 5000) * 100, 100)}%`,
              backgroundColor: group.color,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DiscoveryCard({ group }: { group: (typeof discoveryGroups)[0] }) {
  return (
    <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center">
          <Users size={20} color="#6b7280" />
        </View>
        <View>
          <Text className="font-semibold text-gray-900">{group.name}</Text>
          <Text className="text-gray-500 text-sm">
            {group.memberCount} members • {group.zone}
          </Text>
        </View>
      </View>
      <TouchableOpacity className="px-4 py-2 bg-green-600 rounded-lg">
        <Text className="text-white font-medium">Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
