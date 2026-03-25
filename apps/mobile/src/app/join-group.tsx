import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

export default function JoinGroupScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const cleanCode = inviteCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const canSubmit = cleanCode.length === 8;

  const handleJoin = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    try {
      // First search for group by invite code, then join
      // The API expects group ID + invite code
      // For now, we'll use a search-then-join pattern
      const result = await api.request<{ id: string }>(`/api/v1/groups/join-by-code`, {
        method: "POST",
        body: JSON.stringify({ inviteCode: cleanCode }),
      });

      if (result.success && result.data) {
        router.replace(`/group/${result.data.id}`);
      } else {
        setError(result.error?.message ?? "Invalid invite code or group not found.");
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
          <Text className="text-[#d5f0cd] font-bold text-lg">Join Group</Text>
          <View className="w-16" />
        </View>

        <View className="flex-1 px-6 pt-8">
          {/* Illustration */}
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">👥</Text>
            <Text className="text-[#d5f0cd] font-bold text-xl text-center mb-2">
              Got an invite code?
            </Text>
            <Text className="text-[#99b292] text-sm text-center">
              Enter the 8-character code shared by your group leader to join their team
            </Text>
          </View>

          {/* Code Input */}
          <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-3">
            Invite Code
          </Text>
          <View className="bg-[#051e06] border border-[#374d34] rounded-xl overflow-hidden mb-2">
            <TextInput
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              placeholder="e.g. IRON2024"
              placeholderTextColor="#445b41"
              autoCapitalize="characters"
              maxLength={8}
              className="px-4 py-4 text-[#6bff8f] text-2xl font-black text-center tracking-[6px]"
            />
          </View>
          <Text className="text-[#445b41] text-xs text-center mb-8">
            {cleanCode.length}/8 characters
          </Text>

          {/* Error */}
          {error ? (
            <View className="bg-red-900/30 border border-red-700 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleJoin}
            disabled={!canSubmit || isLoading}
            className={`py-4 rounded-xl items-center ${
              canSubmit && !isLoading
                ? "bg-[#22c55e] border border-[#6bff8f]"
                : "bg-[#1a2e1b] border border-[#374d34]"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#002c0f" />
            ) : (
              <Text className={`font-bold text-lg ${canSubmit ? "text-[#002c0f]" : "text-[#445b41]"}`}>
                Join Group
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
