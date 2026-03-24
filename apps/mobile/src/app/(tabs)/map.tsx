import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Filter, Layers, Navigation } from "lucide-react-native";

// Note: MapBox requires native linking, this is a placeholder structure
// In production, use @rnmapbox/maps with proper setup

export default function MapScreen() {
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"territory" | "heatmap" | "gyms">("territory");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Map Header */}
      <View className="absolute top-12 left-4 right-4 z-10">
        <View className="bg-white rounded-xl shadow-lg p-3 flex-row items-center justify-between">
          <View className="flex-row gap-2">
            <ViewModeButton
              active={viewMode === "territory"}
              label="Territory"
              onPress={() => setViewMode("territory")}
            />
            <ViewModeButton
              active={viewMode === "heatmap"}
              label="Heatmap"
              onPress={() => setViewMode("heatmap")}
            />
            <ViewModeButton
              active={viewMode === "gyms"}
              label="Gyms"
              onPress={() => setViewMode("gyms")}
            />
          </View>
          <TouchableOpacity className="p-2 bg-gray-100 rounded-lg">
            <Filter size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Placeholder */}
      <View className="flex-1 bg-gray-100 items-center justify-center">
        {isLoading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : (
          <View className="items-center">
            <Text className="text-6xl mb-4">🗺️</Text>
            <Text className="text-gray-600 text-lg font-medium">
              Territory Map
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center px-8">
              Map integration with Mapbox will show zone boundaries, gym
              locations, and territory control
            </Text>

            {/* Mock Zone Data */}
            <View className="mt-6 w-80">
              <MockZoneCard
                zoneName="Vijay Nagar"
                pinCode="462001"
                controller="Ironclad Fitness"
                controllerColor="#22c55e"
                totalAp={4820}
                onPress={() =>
                  setSelectedZone({
                    name: "Vijay Nagar",
                    pinCode: "462001",
                    controller: "Ironclad Fitness",
                    score: 4820,
                  })
                }
              />
              <MockZoneCard
                zoneName="MP Nagar"
                pinCode="462003"
                controller="Iron Paradise"
                controllerColor="#3b82f6"
                totalAp={4680}
                onPress={() =>
                  setSelectedZone({
                    name: "MP Nagar",
                    pinCode: "462003",
                    controller: "Iron Paradise",
                    score: 4680,
                  })
                }
              />
            </View>
          </View>
        )}
      </View>

      {/* Floating Action Buttons */}
      <View className="absolute bottom-6 right-4 gap-3">
        <TouchableOpacity className="w-14 h-14 bg-white rounded-full shadow-lg items-center justify-center">
          <Navigation size={24} color="#22c55e" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 bg-green-600 rounded-full shadow-lg items-center justify-center">
          <Plus size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Zone Detail Bottom Sheet */}
      {selectedZone && (
        <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl">
          <View className="p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />

            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-xl font-bold text-gray-900">
                  {selectedZone.name}
                </Text>
                <Text className="text-gray-500">Zone {selectedZone.pinCode}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedZone(null)}
                className="p-2"
              >
                <Text className="text-gray-500">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-2 mb-4">
              <View
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
              />
              <Text className="text-gray-700 font-medium">
                Controlled by {selectedZone.controller}
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Zone Score</Text>
                <Text className="font-bold text-gray-900">
                  {selectedZone.score.toLocaleString()} AP
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Active Groups</Text>
                <Text className="font-bold text-gray-900">5</Text>
              </View>
            </View>

            <TouchableOpacity className="bg-green-600 py-4 rounded-xl items-center">
              <Text className="text-white font-semibold text-lg">
                View Leaderboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function ViewModeButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-2 rounded-lg ${
        active ? "bg-green-100" : "bg-gray-100"
      }`}
    >
      <Text
        className={`font-medium ${active ? "text-green-700" : "text-gray-600"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MockZoneCard({
  zoneName,
  pinCode,
  controller,
  controllerColor,
  totalAp,
  onPress,
}: {
  zoneName: string;
  pinCode: string;
  controller: string;
  controllerColor: string;
  totalAp: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="w-4 h-12 rounded-full"
            style={{ backgroundColor: controllerColor }}
          />
          <View>
            <Text className="font-semibold text-gray-900">{zoneName}</Text>
            <Text className="text-gray-500 text-sm">{pinCode}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-bold text-gray-900">
            {totalAp.toLocaleString()} AP
          </Text>
          <Text className="text-gray-500 text-sm">{controller}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
