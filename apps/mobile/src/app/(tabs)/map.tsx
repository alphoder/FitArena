import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { mockZones, Zone } from "../../data/mockZones";
import { ZoneBottomSheet } from "../../components/ZoneBottomSheet";

// NOTE: react-native-maps requires a native rebuild (npx expo run:android)
// Using territory list view until native build includes the maps module
let MapView: any = null;
let Polygon: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Polygon = maps.Polygon;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch {
  // Native module not available — will show list fallback
}

const BHOPAL_CENTER = { latitude: 23.2599, longitude: 77.4126 };

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0e2c0f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#99b292" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#011202" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a3a1b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0e2c0f" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#051e06" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0f3a11" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#374d34" }] },
];

export default function MapScreen() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const handleZonePress = (zone: Zone) => {
    setSelectedZone(zone);
  };

  // If native maps module isn't available, show territory list view
  if (!MapView) {
    return (
      <View className="flex-1 bg-[#011202]">
        {/* Header */}
        <View className="pt-14 px-6 pb-4">
          <Text className="text-[#6bff8f] text-xs font-bold uppercase tracking-widest mb-1">Territory Map</Text>
          <Text className="text-[#d5f0cd] text-2xl font-bold">Bhopal Zones</Text>
          <Text className="text-[#99b292] text-sm mt-1">Tap a zone to see the leaderboard</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {mockZones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              onPress={() => handleZonePress(zone)}
              className="bg-[#0e2c0f] border border-[#374d34] rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: zone.controllingGroup?.color ?? "#445b41" }}
                  />
                  <View className="flex-1">
                    <Text className="text-[#d5f0cd] font-bold text-base">{zone.name}</Text>
                    <Text className="text-[#99b292] text-xs mt-0.5">
                      {zone.controllingGroup ? `Controlled by ${zone.controllingGroup.name}` : "Neutral — unclaimed!"}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-[#6bff8f] font-bold text-sm">
                    {zone.controllingGroup?.totalAP.toLocaleString() ?? "0"} AP
                  </Text>
                  <Text className="text-[#99b292] text-xs">
                    {zone.leaderboard.length} groups
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View className="h-24" />
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          onPress={() => router.push("/log-activity")}
          style={{ bottom: 24, right: 24 }}
          className="absolute w-16 h-16 bg-[#22C55E] rounded-full shadow-lg items-center justify-center border border-[#6bff8f] z-10"
        >
          <Text className="text-[#002c0f] text-3xl font-bold leading-none mb-1">+</Text>
        </TouchableOpacity>

        <ZoneBottomSheet
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
        />
      </View>
    );
  }

  // Full map view (when native module is available after rebuild)
  return (
    <View className="flex-1 bg-[#011202]">
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...BHOPAL_CENTER,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {mockZones.map((zone) => {
          const color = zone.controllingGroup?.color ?? "#445b41";
          const isSelected = selectedZone?.id === zone.id;
          return (
            <Polygon
              key={zone.id}
              coordinates={zone.polygon.map(([lng, lat]: [number, number]) => ({
                latitude: lat,
                longitude: lng,
              }))}
              fillColor={`${color}50`}
              strokeColor={color}
              strokeWidth={isSelected ? 3 : 1.5}
              tappable
              onPress={() => handleZonePress(zone)}
            />
          );
        })}

        {mockZones.map((zone) => (
          <Marker
            key={`marker-${zone.id}`}
            coordinate={{
              latitude: zone.center[1],
              longitude: zone.center[0],
            }}
            onPress={() => handleZonePress(zone)}
          >
            <View className="items-center">
              <View className="bg-[#0e2c0f]/90 border border-[#374d34] rounded-lg px-2 py-1">
                <Text className="text-[#d5f0cd] text-[10px] font-bold">{zone.name}</Text>
                {zone.controllingGroup && (
                  <Text className="text-[#6bff8f] text-[9px] font-bold text-center">
                    {zone.controllingGroup.totalAP.toLocaleString()} AP
                  </Text>
                )}
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <View pointerEvents="none" className="absolute top-14 left-6 right-6 z-10">
        <View className="bg-[#0e2c0f]/90 border border-[#374d34] rounded-2xl p-4 flex-row items-center shadow-lg">
          <View className="w-10 h-10 bg-[#051e06] rounded-xl items-center justify-center border border-[#374d34] mr-4">
            <Text className="text-xl">📍</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[#99b292] text-xs font-bold uppercase tracking-widest mb-0.5">Current Zone</Text>
            <Text className="text-[#d5f0cd] font-bold text-lg">
              {selectedZone ? selectedZone.name : "Kolar Road, Bhopal"}
            </Text>
          </View>
          <View className="bg-[#22c55e]/20 px-3 py-1.5 rounded-lg border border-[#6bff8f]/30">
            <Text className="text-[#6bff8f] font-bold text-sm">
              #{selectedZone ? selectedZone.leaderboard[0]?.rank || "-" : "3"}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/log-activity")}
        style={{ bottom: 24, right: 24 }}
        className="absolute w-16 h-16 bg-[#22C55E] rounded-full shadow-lg items-center justify-center border border-[#6bff8f] z-10"
      >
        <Text className="text-[#002c0f] text-3xl font-bold leading-none mb-1">+</Text>
      </TouchableOpacity>

      <ZoneBottomSheet
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
      />
    </View>
  );
}
