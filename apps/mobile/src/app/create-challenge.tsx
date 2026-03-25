import { useState } from "react";
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
import { api } from "../lib/api";

type ChallengeType = "group" | "versus" | "zone" | "stake";
type TargetType = "ap_total" | "activity_count" | "streak" | "distance";

const CHALLENGE_TYPES: { value: ChallengeType; label: string; emoji: string; desc: string }[] = [
  { value: "group", label: "Group", emoji: "👥", desc: "Your group competes together" },
  { value: "versus", label: "1v1", emoji: "⚔️", desc: "Head-to-head battle" },
  { value: "zone", label: "Zone", emoji: "🗺️", desc: "Everyone in your zone" },
  { value: "stake", label: "Stake", emoji: "💰", desc: "Put money on it" },
];

const TARGET_TYPES: { value: TargetType; label: string; emoji: string; unit: string }[] = [
  { value: "ap_total", label: "Total AP", emoji: "⚡", unit: "AP" },
  { value: "activity_count", label: "Activities", emoji: "🏋️", unit: "workouts" },
  { value: "streak", label: "Streak", emoji: "🔥", unit: "days" },
  { value: "distance", label: "Distance", emoji: "📏", unit: "km" },
];

const DURATION_PRESETS = [
  { days: 2, label: "Weekend" },
  { days: 7, label: "1 Week" },
  { days: 14, label: "2 Weeks" },
  { days: 30, label: "1 Month" },
];

const STAKE_PRESETS = [50, 100, 200, 500]; // in INR

export default function CreateChallengeScreen() {
  const [name, setName] = useState("");
  const [challengeType, setChallengeType] = useState<ChallengeType>("group");
  const [targetType, setTargetType] = useState<TargetType>("ap_total");
  const [targetValue, setTargetValue] = useState("");
  const [durationDays, setDurationDays] = useState<number>(7);
  const [stakeAmount, setStakeAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim().length >= 3 && parseInt(targetValue, 10) > 0 && durationDays > 0;

  const handleCreate = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1); // Start tomorrow
    startsAt.setHours(0, 0, 0, 0);

    try {
      const result = await api.createChallenge({
        name: name.trim(),
        type: challengeType,
        targetType,
        targetValue: parseInt(targetValue, 10),
        durationDays,
        startsAt: startsAt.toISOString(),
        ...(challengeType === "stake" && stakeAmount ? { stakeAmount: stakeAmount * 100 } : {}),
      });

      if (result.success && result.data) {
        router.replace(`/challenge/${result.data.id}`);
      } else {
        setError(result.error?.message ?? "Failed to create challenge.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
            <Text className="text-[#99b292] font-semibold text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-[#d5f0cd] font-bold text-lg">Create Challenge</Text>
          <View className="w-16" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Name */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3 mt-4">
            Challenge Name
          </Text>
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-6">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Weekend Warrior Sprint"
              placeholderTextColor="#445b41"
              maxLength={200}
              className="px-4 py-3.5 text-[#d5f0cd] text-base"
            />
          </View>

          {/* Challenge Type */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Type
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {CHALLENGE_TYPES.map((type) => {
              const isSelected = challengeType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => {
                    setChallengeType(type.value);
                    if (type.value !== "stake") setStakeAmount(null);
                  }}
                  className={`flex-1 min-w-[45%] p-3 rounded-xl border ${
                    isSelected ? "bg-[#0f3a11] border-[#6bff8f]" : "bg-[#051e06] border-[#374d34]"
                  }`}
                >
                  <Text className="text-lg mb-1">{type.emoji}</Text>
                  <Text className={`font-bold text-sm ${isSelected ? "text-[#6bff8f]" : "text-[#d5f0cd]"}`}>
                    {type.label}
                  </Text>
                  <Text className="text-[#445b41] text-xs">{type.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Target Type */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Goal Type
          </Text>
          <View className="flex-row gap-2 mb-3">
            {TARGET_TYPES.map((t) => {
              const isSelected = targetType === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setTargetType(t.value)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    isSelected ? "bg-[#0f3a11] border-[#6bff8f]" : "bg-[#051e06] border-[#374d34]"
                  }`}
                >
                  <Text className="text-base mb-0.5">{t.emoji}</Text>
                  <Text className={`text-xs font-bold ${isSelected ? "text-[#6bff8f]" : "text-[#99b292]"}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Target Value */}
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-6 flex-row items-center">
            <TextInput
              value={targetValue}
              onChangeText={(t) => setTargetValue(t.replace(/[^0-9]/g, ""))}
              placeholder={`Target ${TARGET_TYPES.find((t) => t.value === targetType)?.unit ?? ""}`}
              placeholderTextColor="#445b41"
              keyboardType="number-pad"
              maxLength={6}
              className="flex-1 px-4 py-3.5 text-[#d5f0cd] text-base"
            />
            <Text className="pr-4 text-[#445b41] font-medium">
              {TARGET_TYPES.find((t) => t.value === targetType)?.unit}
            </Text>
          </View>

          {/* Duration */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Duration
          </Text>
          <View className="flex-row gap-2 mb-6">
            {DURATION_PRESETS.map((d) => {
              const isSelected = durationDays === d.days;
              return (
                <TouchableOpacity
                  key={d.days}
                  onPress={() => setDurationDays(d.days)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    isSelected ? "bg-[#0f3a11] border-[#6bff8f]" : "bg-[#051e06] border-[#374d34]"
                  }`}
                >
                  <Text className={`text-sm font-bold ${isSelected ? "text-[#6bff8f]" : "text-[#99b292]"}`}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Stake Amount (only for stake type) */}
          {challengeType === "stake" && (
            <>
              <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
                Stake Amount (INR)
              </Text>
              <View className="flex-row gap-2 mb-3">
                {STAKE_PRESETS.map((amount) => {
                  const isSelected = stakeAmount === amount;
                  return (
                    <TouchableOpacity
                      key={amount}
                      onPress={() => setStakeAmount(amount)}
                      className={`flex-1 py-3 rounded-xl border items-center ${
                        isSelected ? "bg-[#f59e0b]/20 border-[#f59e0b]" : "bg-[#051e06] border-[#374d34]"
                      }`}
                    >
                      <Text className={`text-sm font-bold ${isSelected ? "text-[#f59e0b]" : "text-[#99b292]"}`}>
                        ₹{amount}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View className="bg-[#1a2e1b] border border-[#374d34] rounded-xl p-3 mb-6">
                <Text className="text-[#99b292] text-xs text-center">
                  Platform fee: 15%. Winner takes the rest. Minimum confidence score 0.8 required.
                </Text>
              </View>
            </>
          )}

          {/* Error */}
          {error ? (
            <View className="bg-red-900/30 border border-red-700 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!canSubmit || isLoading}
            className={`py-4 rounded-xl items-center mb-10 ${
              canSubmit && !isLoading ? "bg-[#22c55e] border border-[#6bff8f]" : "bg-[#1a2e1b] border border-[#374d34]"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#002c0f" />
            ) : (
              <Text className={`font-bold text-lg ${canSubmit ? "text-[#002c0f]" : "text-[#445b41]"}`}>
                Create Challenge
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
