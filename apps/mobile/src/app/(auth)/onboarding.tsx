import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth";

const activityTypes = [
  { id: "gym", label: "Gym / Weights", emoji: "🏋️" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "cycling", label: "Cycling", emoji: "🚴" },
  { id: "swimming", label: "Swimming", emoji: "🏊" },
  { id: "yoga", label: "Yoga", emoji: "🧘" },
  { id: "sports", label: "Sports", emoji: "⚽" },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [homePinCode, setHomePinCode] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { refreshUser } = useAuthStore();

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id)
        ? prev.filter((a) => a !== id)
        : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);

    const response = await api.updateProfile({
      displayName,
      homePinCode,
    });

    if (response.success) {
      await refreshUser();
      router.replace("/(tabs)/map");
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          {/* Progress */}
          <View className="flex-row gap-2 mt-6 mb-8">
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  s <= step ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            ))}
          </View>

          {step === 1 && (
            <View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                What should we call you?
              </Text>
              <Text className="text-gray-600 mb-8">
                This will be visible to other players in your groups
              </Text>

              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                className="border border-gray-300 rounded-xl px-4 py-4 text-lg mb-6"
                autoFocus
              />

              <TouchableOpacity
                onPress={() => setStep(2)}
                disabled={displayName.length < 2}
                className={`py-4 rounded-xl items-center ${
                  displayName.length < 2 ? "bg-gray-300" : "bg-green-600"
                }`}
              >
                <Text className="text-white font-semibold text-lg">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Where do you work out?
              </Text>
              <Text className="text-gray-600 mb-8">
                Your home zone determines which territories you compete for
              </Text>

              <View className="flex-row items-center border border-gray-300 rounded-xl overflow-hidden mb-4">
                <View className="px-4 py-4 bg-gray-50 border-r border-gray-300">
                  <Text className="text-gray-500">📍</Text>
                </View>
                <TextInput
                  value={homePinCode}
                  onChangeText={(text) => setHomePinCode(text.replace(/[^0-9]/g, ""))}
                  placeholder="Enter PIN code"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="flex-1 px-4 py-4 text-lg"
                />
              </View>

              {homePinCode.length === 6 && (
                <View className="bg-green-50 p-4 rounded-xl mb-6">
                  <Text className="text-green-700 font-medium">
                    ✓ Zone found: Vijay Nagar, Bhopal
                  </Text>
                  <Text className="text-green-600 text-sm mt-1">
                    3 groups competing in this zone
                  </Text>
                </View>
              )}

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl items-center border border-gray-300"
                >
                  <Text className="text-gray-700 font-semibold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStep(3)}
                  disabled={homePinCode.length !== 6}
                  className={`flex-1 py-4 rounded-xl items-center ${
                    homePinCode.length !== 6 ? "bg-gray-300" : "bg-green-600"
                  }`}
                >
                  <Text className="text-white font-semibold">Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                What activities do you do?
              </Text>
              <Text className="text-gray-600 mb-8">
                We'll customize your experience based on your interests
              </Text>

              <View className="flex-row flex-wrap gap-3 mb-8">
                {activityTypes.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    onPress={() => toggleActivity(activity.id)}
                    className={`px-4 py-3 rounded-xl border ${
                      selectedActivities.includes(activity.id)
                        ? "bg-green-100 border-green-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className="text-center text-2xl mb-1">
                      {activity.emoji}
                    </Text>
                    <Text
                      className={`font-medium ${
                        selectedActivities.includes(activity.id)
                          ? "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {activity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setStep(2)}
                  className="flex-1 py-4 rounded-xl items-center border border-gray-300"
                >
                  <Text className="text-gray-700 font-semibold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleComplete}
                  disabled={isLoading || selectedActivities.length === 0}
                  className={`flex-1 py-4 rounded-xl items-center ${
                    isLoading || selectedActivities.length === 0
                      ? "bg-gray-300"
                      : "bg-green-600"
                  }`}
                >
                  <Text className="text-white font-semibold">
                    {isLoading ? "Setting up..." : "Let's Go!"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
