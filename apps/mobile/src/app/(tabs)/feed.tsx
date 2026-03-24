import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageCircle, Share2, MapPin } from "lucide-react-native";

const mockFeedItems = [
  {
    id: "1",
    type: "activity",
    user: {
      name: "Rahul K.",
      avatar: null,
      initials: "RK",
    },
    group: "Ironclad Fitness",
    content: "Just finished a 45-min strength session 💪",
    activityType: "Gym",
    arenaPoints: 68,
    timestamp: "2 hours ago",
    likes: 12,
    comments: 3,
  },
  {
    id: "2",
    type: "territory",
    zone: "Vijay Nagar",
    pinCode: "462001",
    newController: "Ironclad Fitness",
    previousController: "Iron Paradise",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    type: "activity",
    user: {
      name: "Priya S.",
      avatar: null,
      initials: "PS",
    },
    group: "Bhopal Runners",
    content: "Morning run around the lake! 🏃‍♀️",
    activityType: "Running",
    arenaPoints: 95,
    distance: "5.2 km",
    timestamp: "4 hours ago",
    likes: 24,
    comments: 8,
  },
  {
    id: "4",
    type: "badge",
    user: {
      name: "Amit S.",
      avatar: null,
      initials: "AS",
    },
    badge: "7-Day Streak",
    badgeEmoji: "🔥",
    timestamp: "Yesterday",
    likes: 18,
  },
];

export default function FeedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Activity Feed</Text>
      </View>

      <ScrollView className="flex-1">
        {mockFeedItems.map((item) => (
          <FeedItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedItem({ item }: { item: (typeof mockFeedItems)[0] }) {
  if (item.type === "territory") {
    return <TerritoryChangeCard item={item as any} />;
  }

  if (item.type === "badge") {
    return <BadgeEarnedCard item={item as any} />;
  }

  return <ActivityCard item={item as any} />;
}

function ActivityCard({
  item,
}: {
  item: {
    user: { name: string; initials: string };
    group: string;
    content: string;
    activityType: string;
    arenaPoints: number;
    distance?: string;
    timestamp: string;
    likes: number;
    comments: number;
  };
}) {
  return (
    <View className="bg-white p-4 border-b border-gray-100">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
          <Text className="font-semibold text-green-700">
            {item.user.initials}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="font-semibold text-gray-900">{item.user.name}</Text>
            <Text className="text-gray-400 mx-1">•</Text>
            <Text className="text-gray-500">{item.group}</Text>
          </View>
          <Text className="text-gray-400 text-sm">{item.timestamp}</Text>
        </View>
      </View>

      {/* Content */}
      <Text className="text-gray-800 mb-3">{item.content}</Text>

      {/* Activity Stats */}
      <View className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">
            {item.activityType === "Gym" ? "🏋️" : "🏃"}
          </Text>
          <View>
            <Text className="font-semibold text-gray-900">
              {item.activityType}
            </Text>
            {item.distance && (
              <Text className="text-gray-500 text-sm">{item.distance}</Text>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xl font-bold text-green-600">
            +{item.arenaPoints}
          </Text>
          <Text className="text-gray-500 text-sm">AP</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="flex-row items-center">
            <Heart size={20} color="#9ca3af" />
            <Text className="ml-1 text-gray-500">{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <MessageCircle size={20} color="#9ca3af" />
            <Text className="ml-1 text-gray-500">{item.comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Share2 size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TerritoryChangeCard({
  item,
}: {
  item: {
    zone: string;
    pinCode: string;
    newController: string;
    previousController: string;
    timestamp: string;
  };
}) {
  return (
    <View className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
      <View className="flex-row items-center mb-2">
        <MapPin size={18} color="#16a34a" />
        <Text className="ml-2 font-semibold text-green-700">
          Territory Change
        </Text>
        <Text className="text-gray-400 ml-auto text-sm">{item.timestamp}</Text>
      </View>
      <Text className="text-gray-800">
        <Text className="font-semibold">{item.newController}</Text> now controls{" "}
        <Text className="font-semibold">{item.zone}</Text> ({item.pinCode})
      </Text>
      <Text className="text-gray-500 text-sm mt-1">
        Previously held by {item.previousController}
      </Text>
    </View>
  );
}

function BadgeEarnedCard({
  item,
}: {
  item: {
    user: { name: string; initials: string };
    badge: string;
    badgeEmoji: string;
    timestamp: string;
    likes: number;
  };
}) {
  return (
    <View className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 border-b border-yellow-100">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center">
          <Text className="font-semibold text-yellow-700">
            {item.user.initials}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-gray-800">
            <Text className="font-semibold">{item.user.name}</Text> earned a
            badge!
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-2xl mr-2">{item.badgeEmoji}</Text>
            <Text className="font-semibold text-yellow-700">{item.badge}</Text>
          </View>
        </View>
        <TouchableOpacity className="flex-row items-center">
          <Heart size={18} color="#9ca3af" />
          <Text className="ml-1 text-gray-500">{item.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
