import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  ChevronRight,
  Award,
  Activity,
  Flame,
  Zap,
  Link2,
  LogOut,
} from "lucide-react-native";
import { useAuthStore } from "../../store/auth";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-6 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-900">Profile</Text>
            <TouchableOpacity className="p-2">
              <Settings size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View className="flex-row items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
              <Text className="text-3xl font-bold text-green-700">
                {user?.displayName?.[0] || "U"}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {user?.displayName || "User"}
              </Text>
              <Text className="text-gray-500">Level {user?.level || 1}</Text>
              <View className="flex-row items-center mt-2">
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-medium">
                    {user?.xpTotal || 0} XP
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            This Week
          </Text>
          <View className="flex-row">
            <StatCard icon={<Zap size={20} color="#22c55e" />} value="680" label="AP" />
            <StatCard icon={<Activity size={20} color="#3b82f6" />} value="4" label="Activities" />
            <StatCard icon={<Flame size={20} color="#f97316" />} value={String(user?.currentStreak || 0)} label="Streak" />
          </View>
        </View>

        {/* Badges */}
        <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Badges</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-green-600 font-medium">View All</Text>
              <ChevronRight size={16} color="#22c55e" />
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-3">
            <BadgeItem emoji="🔥" label="7-Day Streak" />
            <BadgeItem emoji="🏃" label="First Run" />
            <BadgeItem emoji="👥" label="Team Player" />
            <BadgeItem emoji="🌟" label="Top 10" />
          </View>
        </View>

        {/* Connected Apps */}
        <View className="bg-white mx-4 mb-4 rounded-xl overflow-hidden shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 p-4 pb-2">
            Connected Apps
          </Text>
          <MenuItem
            icon={<Link2 size={20} color="#FC4C02" />}
            label="Strava"
            value={user?.stravaConnected ? "Connected" : "Connect"}
            onPress={() => {}}
          />
          <MenuItem
            icon={<Link2 size={20} color="#4285F4" />}
            label="Google Fit"
            value={user?.googleFitConnected ? "Connected" : "Connect"}
            onPress={() => {}}
          />
        </View>

        {/* Account Settings */}
        <View className="bg-white mx-4 mb-4 rounded-xl overflow-hidden shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 p-4 pb-2">
            Account
          </Text>
          <MenuItem
            icon={<Award size={20} color="#6b7280" />}
            label="Achievements"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Activity size={20} color="#6b7280" />}
            label="Activity History"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Settings size={20} color="#6b7280" />}
            label="Settings"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white mx-4 mb-8 rounded-xl p-4 flex-row items-center justify-center shadow-sm"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center">
      {icon}
      <Text className="text-2xl font-bold text-gray-900 mt-1">{value}</Text>
      <Text className="text-gray-500 text-sm">{label}</Text>
    </View>
  );
}

function BadgeItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View className="items-center">
      <View className="w-14 h-14 bg-gray-100 rounded-xl items-center justify-center mb-1">
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <Text className="text-xs text-gray-600 text-center">{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-4 border-b border-gray-100"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="text-gray-900 ml-3">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && (
          <Text
            className={`mr-2 ${
              value === "Connect" ? "text-green-600" : "text-gray-500"
            }`}
          >
            {value}
          </Text>
        )}
        <ChevronRight size={16} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
}
