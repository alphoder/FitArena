import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Clock, Users, ChevronRight, Plus } from "lucide-react-native";

const mockChallenges = [
  {
    id: "1",
    name: "4 Workouts This Week",
    type: "group",
    status: "active",
    progress: 3,
    target: 4,
    endsIn: "3 days",
    participants: 8,
    userProgress: 75,
  },
  {
    id: "2",
    name: "March Consistency Challenge",
    type: "zone",
    status: "active",
    progress: 18,
    target: 30,
    endsIn: "1 week",
    participants: 45,
    userProgress: 60,
  },
  {
    id: "3",
    name: "Weekend Warrior",
    type: "versus",
    status: "pending",
    opponent: "Iron Paradise",
    startsIn: "2 days",
  },
];

const completedChallenges = [
  {
    id: "4",
    name: "February Fitness Challenge",
    type: "zone",
    result: "Won",
    rank: 3,
    totalParticipants: 120,
  },
];

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Challenges</Text>
        <TouchableOpacity className="w-10 h-10 bg-green-600 rounded-full items-center justify-center">
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-4">
        <TouchableOpacity
          onPress={() => setActiveTab("active")}
          className={`flex-1 py-3 rounded-xl mr-2 ${
            activeTab === "active" ? "bg-green-600" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "active" ? "text-white" : "text-gray-600"
            }`}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("completed")}
          className={`flex-1 py-3 rounded-xl ${
            activeTab === "completed" ? "bg-green-600" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "completed" ? "text-white" : "text-gray-600"
            }`}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {activeTab === "active" ? (
          <>
            {mockChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}

            {/* Quick Challenge Section */}
            <View className="mt-6 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Quick Challenges
              </Text>
              <View className="flex-row gap-3">
                <QuickChallengeButton label="Weekend Sprint" icon="🏃" />
                <QuickChallengeButton label="7-Day Streak" icon="🔥" />
              </View>
            </View>
          </>
        ) : (
          <>
            {completedChallenges.map((challenge) => (
              <CompletedChallengeCard
                key={challenge.id}
                challenge={challenge}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChallengeCard({ challenge }: { challenge: (typeof mockChallenges)[0] }) {
  const isActive = challenge.status === "active";

  return (
    <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View
            className={`px-2 py-1 rounded-full ${
              isActive ? "bg-green-100" : "bg-yellow-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isActive ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {isActive ? "Active" : "Upcoming"}
            </Text>
          </View>
          <View className="px-2 py-1 bg-gray-100 rounded-full">
            <Text className="text-xs text-gray-600 capitalize">
              {challenge.type}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Clock size={14} color="#9ca3af" />
          <Text className="text-gray-500 text-sm ml-1">
            {isActive ? challenge.endsIn : (challenge as any).startsIn}
          </Text>
        </View>
      </View>

      <Text className="text-lg font-semibold text-gray-900 mb-2">
        {challenge.name}
      </Text>

      {isActive && "progress" in challenge && (
        <>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Users size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-sm ml-1">
                {challenge.participants} participants
              </Text>
            </View>
            <Text className="font-semibold text-gray-900">
              {challenge.progress}/{challenge.target}
            </Text>
          </View>

          <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${challenge.userProgress}%`,
              }}
            />
          </View>
        </>
      )}

      {challenge.type === "versus" && (
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-gray-600">
            vs {(challenge as any).opponent}
          </Text>
          <ChevronRight size={20} color="#9ca3af" />
        </View>
      )}
    </TouchableOpacity>
  );
}

function CompletedChallengeCard({
  challenge,
}: {
  challenge: (typeof completedChallenges)[0];
}) {
  const isWin = challenge.result === "Won";

  return (
    <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">{challenge.name}</Text>
          <View className="flex-row items-center mt-1">
            <View
              className={`px-2 py-1 rounded-full mr-2 ${
                isWin ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  isWin ? "text-green-700" : "text-red-700"
                }`}
              >
                {challenge.result}
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">
              #{challenge.rank} of {challenge.totalParticipants}
            </Text>
          </View>
        </View>
        <Trophy size={24} color={isWin ? "#f59e0b" : "#9ca3af"} />
      </View>
    </TouchableOpacity>
  );
}

function QuickChallengeButton({ label, icon }: { label: string; icon: string }) {
  return (
    <TouchableOpacity className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 items-center">
      <Text className="text-2xl mb-2">{icon}</Text>
      <Text className="font-medium text-gray-900">{label}</Text>
    </TouchableOpacity>
  );
}
