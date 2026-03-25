import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState(true);

  const handleConnectStrava = async () => {
    try {
      const result = await api.getStravaAuthUrl();
      if (result.success && result.data) {
        // In production: open in-app browser with result.data.authUrl
        Alert.alert("Strava", "OAuth flow would open here");
      }
    } catch {
      Alert.alert("Error", "Could not connect to Strava");
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
          <Text className="text-[#99b292] font-semibold text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-[#d5f0cd] font-bold text-lg">Settings</Text>
        <View className="w-16" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Account */}
        <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3 mt-4">Account</Text>
        <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-6">
          <InfoRow label="Phone" value={user?.phoneNumber ?? "—"} />
          <InfoRow label="Name" value={user?.displayName ?? "—"} />
          <InfoRow label="Level" value={`${user?.level ?? 1}`} last />
        </View>

        {/* Connected Apps */}
        <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">Connected Apps</Text>
        <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-6">
          <TouchableOpacity onPress={handleConnectStrava} className="flex-row items-center justify-between px-4 py-3.5 border-b border-[#374d34]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#FC4C02]/20 items-center justify-center mr-3">
                <Text className="text-sm font-black" style={{ color: "#FC4C02" }}>S</Text>
              </View>
              <Text className="text-[#d5f0cd] font-medium">Strava</Text>
            </View>
            <View className="px-3 py-1 rounded-lg bg-[#22c55e]/20">
              <Text className="text-[#6bff8f] text-xs font-bold">Connect</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3.5 border-b border-[#374d34]">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#4285F4]/20 items-center justify-center mr-3">
                <Text className="text-sm font-black" style={{ color: "#4285F4" }}>G</Text>
              </View>
              <Text className="text-[#d5f0cd] font-medium">Google Fit</Text>
            </View>
            <View className="px-3 py-1 rounded-lg bg-[#22c55e]/20">
              <Text className="text-[#6bff8f] text-xs font-bold">Connect</Text>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 items-center justify-center mr-3">
                <Text className="text-sm font-black" style={{ color: "#8b5cf6" }}>T</Text>
              </View>
              <Text className="text-[#d5f0cd] font-medium">Wearable (Terra)</Text>
            </View>
            <View className="px-3 py-1 rounded-lg bg-[#445b41]/20">
              <Text className="text-[#445b41] text-xs font-bold">Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">Notifications</Text>
        <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-6">
          <ToggleRow label="Push Notifications" value={pushEnabled} onToggle={setPushEnabled} />
          <ToggleRow label="WhatsApp Digests" value={whatsappEnabled} onToggle={setWhatsappEnabled} />
          <ToggleRow label="Quiet Hours (10PM-7AM)" value={quietHours} onToggle={setQuietHours} last />
        </View>

        {/* Privacy */}
        <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">Privacy</Text>
        <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3.5 border-b border-[#374d34]">
            <Text className="text-[#d5f0cd] font-medium">Activity Visibility</Text>
            <Text className="text-[#99b292] text-sm">Group Only</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-3.5">
            <Text className="text-[#d5f0cd] font-medium">Profile Visibility</Text>
            <Text className="text-[#99b292] text-sm">Public</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text className="text-xs font-bold text-[#99b292] uppercase tracking-widest mb-3">About</Text>
        <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-6">
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Built by" value="Aarambh Labs" last />
        </View>

        {/* Danger Zone */}
        <TouchableOpacity onPress={handleLogout} className="py-3 border border-red-900 rounded-xl items-center mb-4">
          <Text className="text-red-500 font-medium">Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3 border border-red-900/50 rounded-xl items-center mb-10">
          <Text className="text-red-900 font-medium text-sm">Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between px-4 py-3.5 ${!last ? "border-b border-[#374d34]" : ""}`}>
      <Text className="text-[#99b292] font-medium">{label}</Text>
      <Text className="text-[#d5f0cd] font-medium">{value}</Text>
    </View>
  );
}

function ToggleRow({ label, value, onToggle, last = false }: {
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  last?: boolean;
}) {
  return (
    <View className={`flex-row items-center justify-between px-4 py-3 ${!last ? "border-b border-[#374d34]" : ""}`}>
      <Text className="text-[#d5f0cd] font-medium">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#374d34", true: "#22c55e" }}
        thumbColor={value ? "#6bff8f" : "#445b41"}
      />
    </View>
  );
}
