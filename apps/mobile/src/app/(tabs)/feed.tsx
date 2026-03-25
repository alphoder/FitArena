import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FeedItemType = "activity" | "territory" | "badge" | "challenge";

interface ActivityFeedItem {
  id: string;
  type: "activity";
  userName: string;
  userInitials: string;
  groupName: string;
  content: string;
  activityType: string;
  activityEmoji: string;
  arenaPoints: number;
  distance: string | null;
  timestamp: string;
  reactions: { fire: number; muscle: number; clap: number };
  userReaction: string | null;
}

interface TerritoryFeedItem {
  id: string;
  type: "territory";
  zoneName: string;
  pinCode: string;
  newController: string;
  previousController: string;
  timestamp: string;
}

interface BadgeFeedItem {
  id: string;
  type: "badge";
  userName: string;
  userInitials: string;
  badgeName: string;
  badgeEmoji: string;
  timestamp: string;
  reactions: { fire: number; muscle: number; clap: number };
}

interface ChallengeFeedItem {
  id: string;
  type: "challenge";
  challengeName: string;
  winnerName: string;
  participantCount: number;
  timestamp: string;
}

type FeedItem = ActivityFeedItem | TerritoryFeedItem | BadgeFeedItem | ChallengeFeedItem;

const MOCK_FEED: FeedItem[] = [
  {
    id: "f1", type: "activity", userName: "Rahul K.", userInitials: "RK",
    groupName: "Ironclad Fitness", content: "Just finished a 45-min strength session",
    activityType: "Gym", activityEmoji: "🏋️", arenaPoints: 68, distance: null,
    timestamp: "2h ago", reactions: { fire: 8, muscle: 12, clap: 3 }, userReaction: null,
  },
  {
    id: "f2", type: "territory", zoneName: "Kolar Road", pinCode: "462016",
    newController: "Ironclad Fitness", previousController: "Iron Paradise", timestamp: "3h ago",
  },
  {
    id: "f3", type: "activity", userName: "Priya S.", userInitials: "PS",
    groupName: "Bhopal Runners", content: "Morning run around the lake!",
    activityType: "Running", activityEmoji: "🏃", arenaPoints: 95, distance: "5.2 km",
    timestamp: "4h ago", reactions: { fire: 24, muscle: 6, clap: 11 }, userReaction: "fire",
  },
  {
    id: "f4", type: "badge", userName: "Amit S.", userInitials: "AS",
    badgeName: "7-Day Streak", badgeEmoji: "🔥", timestamp: "5h ago",
    reactions: { fire: 18, muscle: 2, clap: 7 },
  },
  {
    id: "f5", type: "challenge", challengeName: "Weekend Warrior Sprint",
    winnerName: "Rahul Singh", participantCount: 6, timestamp: "Yesterday",
  },
  {
    id: "f6", type: "activity", userName: "Vikram P.", userInitials: "VP",
    groupName: "College Fitness Club", content: "HIIT session in the park, destroyed it",
    activityType: "HIIT", activityEmoji: "🔥", arenaPoints: 112, distance: null,
    timestamp: "6h ago", reactions: { fire: 15, muscle: 9, clap: 4 }, userReaction: null,
  },
];

const REACTION_EMOJI = { fire: "🔥", muscle: "💪", clap: "👏" };

export default function FeedScreen() {
  const [feed] = useState<FeedItem[]>(MOCK_FEED);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#011202]" edges={["top"]}>
      <View className="px-6 pt-4 pb-3">
        <Text className="text-2xl font-black text-[#d5f0cd] tracking-tight">Feed</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#6bff8f" />
        }
      >
        {feed.map((item) => {
          switch (item.type) {
            case "activity": return <ActivityCard key={item.id} item={item} />;
            case "territory": return <TerritoryCard key={item.id} item={item} />;
            case "badge": return <BadgeCard key={item.id} item={item} />;
            case "challenge": return <ChallengeResultCard key={item.id} item={item} />;
          }
        })}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityCard({ item }: { item: ActivityFeedItem }) {
  const [reactions, setReactions] = useState(item.reactions);
  const [userReaction, setUserReaction] = useState(item.userReaction);

  const handleReaction = (type: "fire" | "muscle" | "clap") => {
    if (userReaction === type) {
      setUserReaction(null);
      setReactions((prev) => ({ ...prev, [type]: prev[type] - 1 }));
    } else {
      if (userReaction) {
        setReactions((prev) => ({ ...prev, [userReaction as keyof typeof prev]: prev[userReaction as keyof typeof prev] - 1 }));
      }
      setUserReaction(type);
      setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    }
  };

  return (
    <View className="px-6 py-4 border-b border-[#1a2e1b]">
      {/* User row */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-[#0f3a11] border border-[#374d34] rounded-full items-center justify-center">
          <Text className="font-bold text-[#6bff8f] text-sm">{item.userInitials}</Text>
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="font-bold text-[#d5f0cd] text-sm">{item.userName}</Text>
            <Text className="text-[#445b41] mx-1.5">·</Text>
            <Text className="text-[#99b292] text-sm">{item.groupName}</Text>
          </View>
          <Text className="text-[#445b41] text-xs">{item.timestamp}</Text>
        </View>
      </View>

      {/* Content */}
      <Text className="text-[#d5f0cd] text-sm mb-3">{item.content}</Text>

      {/* Activity Stats Card */}
      <View className="bg-[#051e06] border border-[#374d34] rounded-xl p-3 flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{item.activityEmoji}</Text>
          <View>
            <Text className="text-[#d5f0cd] font-bold text-sm">{item.activityType}</Text>
            {item.distance ? <Text className="text-[#445b41] text-xs">{item.distance}</Text> : null}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[#6bff8f] font-black text-xl">+{item.arenaPoints}</Text>
          <Text className="text-[#445b41] text-xs font-bold">AP</Text>
        </View>
      </View>

      {/* Reactions */}
      <View className="flex-row items-center gap-3">
        {(Object.keys(REACTION_EMOJI) as Array<keyof typeof REACTION_EMOJI>).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => handleReaction(type)}
            className={`flex-row items-center px-3 py-1.5 rounded-lg border ${
              userReaction === type ? "bg-[#0f3a11] border-[#6bff8f]" : "bg-[#051e06] border-[#374d34]"
            }`}
          >
            <Text className="text-sm mr-1">{REACTION_EMOJI[type]}</Text>
            <Text className={`text-xs font-bold ${userReaction === type ? "text-[#6bff8f]" : "text-[#445b41]"}`}>
              {reactions[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function TerritoryCard({ item }: { item: TerritoryFeedItem }) {
  return (
    <View className="px-6 py-4 border-b border-[#1a2e1b] bg-[#0f3a11]/30">
      <View className="flex-row items-center mb-2">
        <Text className="text-sm mr-2">🗺️</Text>
        <Text className="text-[#6bff8f] font-bold text-xs uppercase tracking-widest">Territory Change</Text>
        <Text className="text-[#445b41] text-xs ml-auto">{item.timestamp}</Text>
      </View>
      <Text className="text-[#d5f0cd] text-sm">
        <Text className="font-bold">{item.newController}</Text> captured{" "}
        <Text className="font-bold text-[#6bff8f]">{item.zoneName}</Text> ({item.pinCode})
      </Text>
      <Text className="text-[#445b41] text-xs mt-1">
        Previously held by {item.previousController}
      </Text>
    </View>
  );
}

function BadgeCard({ item }: { item: BadgeFeedItem }) {
  return (
    <View className="px-6 py-4 border-b border-[#1a2e1b] bg-[#2a1f00]/20">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-[#0f3a11] border border-[#374d34] rounded-full items-center justify-center">
          <Text className="font-bold text-[#6bff8f] text-sm">{item.userInitials}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[#d5f0cd] text-sm">
            <Text className="font-bold">{item.userName}</Text> earned a badge!
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-2xl mr-2">{item.badgeEmoji}</Text>
            <Text className="text-[#f59e0b] font-bold">{item.badgeName}</Text>
          </View>
        </View>
        <Text className="text-[#445b41] text-xs">{item.timestamp}</Text>
      </View>
    </View>
  );
}

function ChallengeResultCard({ item }: { item: ChallengeFeedItem }) {
  return (
    <View className="px-6 py-4 border-b border-[#1a2e1b] bg-[#1a0f2e]/20">
      <View className="flex-row items-center mb-2">
        <Text className="text-sm mr-2">🏆</Text>
        <Text className="text-[#a855f7] font-bold text-xs uppercase tracking-widest">Challenge Complete</Text>
        <Text className="text-[#445b41] text-xs ml-auto">{item.timestamp}</Text>
      </View>
      <Text className="text-[#d5f0cd] text-sm">
        <Text className="font-bold">{item.winnerName}</Text> won{" "}
        <Text className="font-bold">"{item.challengeName}"</Text>
      </Text>
      <Text className="text-[#445b41] text-xs mt-1">
        {item.participantCount} participants competed
      </Text>
    </View>
  );
}
