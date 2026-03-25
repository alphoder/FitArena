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

type GroupType = "open" | "invite" | "gym" | "club" | "coach";
type PrivacyType = "public" | "unlisted" | "private";

const GROUP_TYPES: { value: GroupType; label: string; emoji: string; desc: string }[] = [
  { value: "open", label: "Open", emoji: "🌍", desc: "Anyone can join" },
  { value: "invite", label: "Invite Only", emoji: "🔒", desc: "Invite code required" },
  { value: "gym", label: "Gym", emoji: "🏋️", desc: "Linked to a gym" },
  { value: "club", label: "Club", emoji: "🏃", desc: "Running/cycling club" },
  { value: "coach", label: "Coach", emoji: "🎯", desc: "Coach-led group" },
];

const PRIVACY_OPTIONS: { value: PrivacyType; label: string; desc: string }[] = [
  { value: "public", label: "Public", desc: "Visible to everyone" },
  { value: "unlisted", label: "Unlisted", desc: "Only via link or code" },
  { value: "private", label: "Private", desc: "Hidden, invite only" },
];

const COLOR_PALETTE = [
  "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
  "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6",
];

export default function CreateGroupScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("open");
  const [privacy, setPrivacy] = useState<PrivacyType>("public");
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim().length >= 3 && name.length <= 100;

  const handleCreate = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await api.createGroup({
        name: name.trim(),
        type: groupType,
        description: description.trim() || undefined,
        privacy,
        // homeZoneId will be assigned from user's pin code zone on backend
        // For now, this might fail if zone isn't set up — that's fine
        homeZoneId: "00000000-0000-0000-0000-000000000000", // placeholder
      });

      if (result.success && result.data) {
        router.replace(`/group/${result.data.id}`);
      } else {
        setError(result.error?.message ?? "Failed to create group.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setIsLoading(false);
    }
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
          <Text className="text-[#d5f0cd] font-bold text-lg">Create Group</Text>
          <View className="w-16" />
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Group Name */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3 mt-4">
            Group Name
          </Text>
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-6">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ironclad Fitness"
              placeholderTextColor="#445b41"
              maxLength={100}
              className="px-4 py-3.5 text-[#d5f0cd] text-base"
            />
          </View>

          {/* Description */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Description (optional)
          </Text>
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-6">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell people what your group is about"
              placeholderTextColor="#445b41"
              maxLength={500}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="px-4 py-3.5 text-[#d5f0cd] text-base min-h-[80px]"
            />
          </View>

          {/* Group Type */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Group Type
          </Text>
          <View className="gap-2 mb-6">
            {GROUP_TYPES.map((type) => {
              const isSelected = groupType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setGroupType(type.value)}
                  className={`flex-row items-center p-3 rounded-xl border ${
                    isSelected
                      ? "bg-[#0f3a11] border-[#6bff8f]"
                      : "bg-[#051e06] border-[#374d34]"
                  }`}
                >
                  <Text className="text-xl mr-3">{type.emoji}</Text>
                  <View className="flex-1">
                    <Text className={`font-bold text-sm ${isSelected ? "text-[#6bff8f]" : "text-[#d5f0cd]"}`}>
                      {type.label}
                    </Text>
                    <Text className="text-[#99b292] text-xs">{type.desc}</Text>
                  </View>
                  {isSelected && (
                    <View className="w-5 h-5 rounded-full bg-[#6bff8f] items-center justify-center">
                      <Text className="text-[#002c0f] text-xs font-black">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Privacy */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Privacy
          </Text>
          <View className="flex-row gap-2 mb-6">
            {PRIVACY_OPTIONS.map((opt) => {
              const isSelected = privacy === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setPrivacy(opt.value)}
                  className={`flex-1 py-3 px-2 rounded-xl border items-center ${
                    isSelected
                      ? "bg-[#0f3a11] border-[#6bff8f]"
                      : "bg-[#051e06] border-[#374d34]"
                  }`}
                >
                  <Text className={`font-bold text-sm mb-0.5 ${isSelected ? "text-[#6bff8f]" : "text-[#d5f0cd]"}`}>
                    {opt.label}
                  </Text>
                  <Text className="text-[#445b41] text-[10px] text-center">{opt.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Color */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Group Color
          </Text>
          <View className="flex-row gap-3 mb-8">
            {COLOR_PALETTE.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full border-2 ${
                  selectedColor === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </View>

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
              canSubmit && !isLoading
                ? "bg-[#22c55e] border border-[#6bff8f]"
                : "bg-[#1a2e1b] border border-[#374d34]"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#002c0f" />
            ) : (
              <Text className={`font-bold text-lg ${canSubmit ? "text-[#002c0f]" : "text-[#445b41]"}`}>
                Create Group
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
