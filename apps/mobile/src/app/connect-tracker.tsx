import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

interface IntegrationStatus {
  connected: boolean;
  tokenStatus: string | null;
  lastSync: string | null;
  errorCount: number;
}

interface AllIntegrations {
  strava: IntegrationStatus;
  googleFit: IntegrationStatus;
  terra: { connected: boolean; lastSync: string | null };
}

const PROVIDERS = [
  {
    key: "strava" as const,
    name: "Strava",
    emoji: "🟠",
    color: "#FC4C02",
    desc: "Running, cycling, swimming — auto-sync via webhooks",
    multiplier: "Up to 1.0x AP",
  },
  {
    key: "googleFit" as const,
    name: "Google Fit",
    emoji: "🔵",
    color: "#4285F4",
    desc: "Steps, workouts — syncs every 60 minutes",
    multiplier: "Up to 0.95x AP",
  },
  {
    key: "terra" as const,
    name: "Wearable (Terra)",
    emoji: "🟣",
    color: "#8b5cf6",
    desc: "Garmin, Fitbit, Whoop, COROS & 200+ devices",
    multiplier: "Up to 1.0x AP",
    comingSoon: true,
  },
];

function formatLastSync(dateStr: string | null): string {
  if (!dateStr) return "Never synced";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ConnectTrackerScreen() {
  const [integrations, setIntegrations] = useState<AllIntegrations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);

  const fetchStatus = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const result = await api.getIntegrationStatus();
      if (result.success && result.data) {
        setIntegrations(result.data as AllIntegrations);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async (provider: "strava" | "googleFit") => {
    setConnectingProvider(provider);
    try {
      let result;
      if (provider === "strava") {
        result = await api.getStravaAuthUrl();
      } else {
        result = await api.request<{ authUrl: string }>("/api/v1/integrations/google-fit/auth");
      }

      if (result.success && result.data) {
        await Linking.openURL(result.data.authUrl);
      }
    } catch {
      // Handle error
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleSync = async () => {
    setSyncingProvider("strava");
    try {
      await api.syncStrava();
      await fetchStatus(true);
    } catch {
      // Handle error
    } finally {
      setSyncingProvider(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="py-2 pr-4">
          <Text className="text-[#99b292] font-semibold text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-[#d5f0cd] font-bold text-lg">Connected Apps</Text>
        <View className="w-16" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchStatus(true)} tintColor="#6bff8f" />
        }
      >
        {/* Info banner */}
        <View className="bg-[#0f3a11] border border-[#22c55e] rounded-xl p-4 mb-6 mt-2">
          <Text className="text-[#d5f0cd] font-bold text-sm mb-1">Why connect a tracker?</Text>
          <Text className="text-[#99b292] text-xs">
            Connected devices earn up to <Text className="text-[#6bff8f] font-bold">1.0x</Text> Arena Points.{" "}
            Manual entries earn only <Text className="text-[#f59e0b] font-bold">0.7x</Text>.{" "}
            GPS + heart rate data gives the highest verification score.
          </Text>
        </View>

        {isLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator color="#6bff8f" size="large" />
          </View>
        ) : (
          PROVIDERS.map((provider) => {
            const status = integrations?.[provider.key as keyof AllIntegrations];
            const isConnected = status?.connected ?? false;
            const isConnecting = connectingProvider === provider.key;
            const isSyncing = syncingProvider === provider.key;
            const lastSync = "lastSync" in (status ?? {}) ? (status as IntegrationStatus)?.lastSync : null;
            const hasError = "errorCount" in (status ?? {}) && (status as IntegrationStatus)?.errorCount > 0;
            const tokenStatus = "tokenStatus" in (status ?? {}) ? (status as IntegrationStatus)?.tokenStatus : null;

            return (
              <View
                key={provider.key}
                className="bg-[#0e2c0f] border border-[#374d34] rounded-xl p-4 mb-3"
              >
                <View className="flex-row items-start">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center border border-[#374d34] mr-3"
                    style={{ backgroundColor: `${provider.color}15` }}
                  >
                    <Text className="text-2xl">{provider.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-[#d5f0cd] font-bold text-base">{provider.name}</Text>
                      {isConnected && (
                        <View className="px-2 py-0.5 rounded bg-[#22c55e]/20">
                          <Text className="text-[10px] font-bold text-[#6bff8f]">Connected</Text>
                        </View>
                      )}
                      {hasError && tokenStatus === "REFRESH_FAILED" && (
                        <View className="px-2 py-0.5 rounded bg-red-500/20">
                          <Text className="text-[10px] font-bold text-red-400">Token Error</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[#99b292] text-xs mb-1">{provider.desc}</Text>
                    <Text className="text-[#445b41] text-[10px]">{provider.multiplier}</Text>

                    {isConnected && lastSync && (
                      <Text className="text-[#445b41] text-xs mt-2">
                        Last sync: {formatLastSync(lastSync)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Action buttons */}
                <View className="flex-row gap-2 mt-3">
                  {provider.comingSoon ? (
                    <View className="flex-1 py-2.5 rounded-xl bg-[#051e06] border border-[#374d34] items-center">
                      <Text className="text-[#445b41] font-medium text-sm">Coming Soon</Text>
                    </View>
                  ) : isConnected ? (
                    <>
                      <TouchableOpacity
                        onPress={handleSync}
                        disabled={isSyncing}
                        className="flex-1 py-2.5 rounded-xl bg-[#051e06] border border-[#374d34] items-center"
                      >
                        {isSyncing ? (
                          <ActivityIndicator color="#6bff8f" size="small" />
                        ) : (
                          <Text className="text-[#99b292] font-medium text-sm">Sync Now</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity className="py-2.5 px-4 rounded-xl border border-red-900 items-center">
                        <Text className="text-red-500 font-medium text-sm">Disconnect</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleConnect(provider.key as "strava" | "googleFit")}
                      disabled={isConnecting}
                      className="flex-1 py-2.5 rounded-xl border items-center"
                      style={{ backgroundColor: `${provider.color}20`, borderColor: provider.color }}
                    >
                      {isConnecting ? (
                        <ActivityIndicator color={provider.color} size="small" />
                      ) : (
                        <Text className="font-bold text-sm" style={{ color: provider.color }}>
                          Connect {provider.name}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* Manual entry info */}
        <View className="bg-[#051e06] border border-[#374d34] rounded-xl p-4 mt-3 mb-10">
          <Text className="text-[#99b292] text-xs text-center">
            No tracker? You can always <Text className="text-[#6bff8f] font-bold">log activities manually</Text> — max 3 per day at 0.7x AP.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
