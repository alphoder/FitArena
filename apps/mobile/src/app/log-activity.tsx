import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ACTIVITY_MULTIPLIERS, type ActivityType, VERIFICATION_MULTIPLIERS } from "@fitarena/shared/types";
import { api } from "../lib/api";

const ACTIVITY_LABELS: Record<ActivityType, { label: string; emoji: string }> = {
  running_outdoor: { label: "Outdoor Run", emoji: "🏃" },
  running_treadmill: { label: "Treadmill", emoji: "🏃‍♂️" },
  cycling_outdoor: { label: "Outdoor Cycling", emoji: "🚴" },
  cycling_indoor: { label: "Indoor Cycling", emoji: "🚲" },
  swimming: { label: "Swimming", emoji: "🏊" },
  gym: { label: "Gym / Weights", emoji: "🏋️" },
  walking: { label: "Walking", emoji: "🚶" },
  yoga: { label: "Yoga", emoji: "🧘" },
  sports: { label: "Sports", emoji: "⚽" },
  hiit: { label: "HIIT", emoji: "🔥" },
  dance: { label: "Dance", emoji: "💃" },
  home_workout: { label: "Home Workout", emoji: "🏠" },
  other: { label: "Other", emoji: "✨" },
};

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

export default function LogActivityScreen() {
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveDuration = durationMinutes ?? (customDuration ? parseInt(customDuration, 10) : 0);

  // Estimate AP using same formula as backend (manual = 0.7x multiplier)
  const estimatedAP = useMemo(() => {
    if (!activityType || !effectiveDuration || effectiveDuration < 1) return 0;
    const multiplier = ACTIVITY_MULTIPLIERS[activityType];
    const baseAp = Math.round(effectiveDuration * multiplier);
    const manualMultiplier = VERIFICATION_MULTIPLIERS.manual;
    return Math.min(Math.round(baseAp * manualMultiplier), 200); // Capped at 200
  }, [activityType, effectiveDuration]);

  const canSubmit = activityType && effectiveDuration >= 1 && effectiveDuration <= 240;

  const handleSubmit = async () => {
    if (!canSubmit || !activityType) return;

    setIsLoading(true);
    setError("");

    const durationSeconds = effectiveDuration * 60;

    try {
      const result = await api.createActivity({
        activityType,
        durationSeconds,
        ...(distanceKm ? { distanceMeters: Math.round(parseFloat(distanceKm) * 1000) } : {}),
        ...(calories ? { calories: parseInt(calories, 10) } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      if (result.success) {
        router.back();
      } else {
        setError(result.error?.message ?? "Failed to log activity. Try again.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDurationPreset = (minutes: number) => {
    setDurationMinutes(minutes);
    setCustomDuration("");
  };

  const handleCustomDuration = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setCustomDuration(cleaned);
    setDurationMinutes(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
            <Text className="text-[#99b292] font-semibold text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-[#d5f0cd] font-bold text-lg">Log Activity</Text>
          <View className="w-16" />
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Manual Entry Notice */}
          <View className="bg-[#1a2e1b] border border-[#374d34] rounded-xl p-3 mb-6">
            <Text className="text-[#99b292] text-xs text-center">
              Manual entries earn <Text className="text-[#6bff8f] font-bold">0.7x</Text> AP.
              Connect a tracker for up to <Text className="text-[#6bff8f] font-bold">1.0x</Text>
            </Text>
          </View>

          {/* Activity Type */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            What did you do?
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityType[]).map((type) => {
              const { label, emoji } = ACTIVITY_LABELS[type];
              const isSelected = activityType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setActivityType(type)}
                  className={`flex-row items-center px-3 py-2.5 rounded-xl border ${
                    isSelected
                      ? "bg-[#0f3a11] border-[#6bff8f]"
                      : "bg-[#051e06] border-[#374d34]"
                  }`}
                >
                  <Text className="text-base mr-1.5">{emoji}</Text>
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? "text-[#6bff8f]" : "text-[#99b292]"
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Duration */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            How long?
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {DURATION_PRESETS.map((mins) => {
              const isSelected = durationMinutes === mins && !customDuration;
              return (
                <TouchableOpacity
                  key={mins}
                  onPress={() => handleDurationPreset(mins)}
                  className={`px-4 py-3 rounded-xl border ${
                    isSelected
                      ? "bg-[#0f3a11] border-[#6bff8f]"
                      : "bg-[#051e06] border-[#374d34]"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? "text-[#6bff8f]" : "text-[#99b292]"
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-8">
            <TextInput
              value={customDuration}
              onChangeText={handleCustomDuration}
              placeholder="Or enter custom minutes (1-240)"
              placeholderTextColor="#445b41"
              keyboardType="number-pad"
              maxLength={3}
              className="px-4 py-3.5 text-[#d5f0cd] text-base"
            />
          </View>

          {/* Optional Fields */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Optional Details
          </Text>

          {/* Distance */}
          <View className="flex-row items-center bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-3">
            <Text className="pl-4 text-[#445b41] text-sm font-medium w-24">Distance</Text>
            <TextInput
              value={distanceKm}
              onChangeText={(t) => setDistanceKm(t.replace(/[^0-9.]/g, ""))}
              placeholder="km"
              placeholderTextColor="#445b41"
              keyboardType="decimal-pad"
              maxLength={6}
              className="flex-1 px-3 py-3.5 text-[#d5f0cd] text-base"
            />
          </View>

          {/* Calories */}
          <View className="flex-row items-center bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-3">
            <Text className="pl-4 text-[#445b41] text-sm font-medium w-24">Calories</Text>
            <TextInput
              value={calories}
              onChangeText={(t) => setCalories(t.replace(/[^0-9]/g, ""))}
              placeholder="kcal"
              placeholderTextColor="#445b41"
              keyboardType="number-pad"
              maxLength={5}
              className="flex-1 px-3 py-3.5 text-[#d5f0cd] text-base"
            />
          </View>

          {/* Notes */}
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-8">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor="#445b41"
              maxLength={500}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="px-4 py-3.5 text-[#d5f0cd] text-base min-h-[80px]"
            />
          </View>

          {/* AP Estimate */}
          {activityType && effectiveDuration > 0 && (
            <View className="bg-[#0f3a11] border border-[#22c55e] rounded-xl p-4 mb-6 items-center">
              <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest mb-1">
                Estimated Arena Points
              </Text>
              <Text className="text-[#6bff8f] text-4xl font-black">
                +{estimatedAP}
              </Text>
              <Text className="text-[#445b41] text-xs mt-1">
                {ACTIVITY_MULTIPLIERS[activityType]}x multiplier · 0.7x manual
              </Text>
            </View>
          )}

          {/* Error */}
          {error ? (
            <View className="bg-red-900/30 border border-red-700 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}
            className={`py-4 rounded-xl items-center mb-10 ${
              canSubmit && !isLoading
                ? "bg-[#22c55e] border border-[#6bff8f]"
                : "bg-[#1a2e1b] border border-[#374d34]"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#002c0f" />
            ) : (
              <Text
                className={`font-bold text-lg ${
                  canSubmit ? "text-[#002c0f]" : "text-[#445b41]"
                }`}
              >
                Log Activity
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
