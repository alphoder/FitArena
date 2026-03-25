import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, PanResponder, ScrollView, Dimensions } from "react-native";
import { Zone } from "../data/mockZones";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ZoneBottomSheetProps {
  zone: Zone | null;
  onClose: () => void;
}

export function ZoneBottomSheet({ zone, onClose }: ZoneBottomSheetProps) {
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Open animation when zone changes
  useEffect(() => {
    if (zone) {
      Animated.spring(panY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12,
      }).start();
    } else {
      Animated.timing(panY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [zone, panY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 1.5) {
          // close
          Animated.timing(panY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          // snap back
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  if (!zone) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY: panY }] }}
      className="absolute bottom-0 left-0 right-0 bg-[#0e2c0f] rounded-t-3xl shadow-2xl border-t border-[#374d34] h-[65%] z-50"
    >
      <View {...panResponder.panHandlers} className="w-full h-10 items-center justify-center pt-2 bg-transparent z-40">
        <View className="w-12 h-1.5 bg-[#445b41] rounded-full" />
      </View>

      <ScrollView className="px-6 pb-8" bounces={false} showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between flex-wrap items-start mb-6">
          <View>
            <Text className="text-3xl font-bold text-[#d5f0cd] tracking-tight">{zone.name}</Text>
            <Text className="text-[#99b292] font-semibold tracking-widest mt-1">ZONE {zone.pinCode}</Text>
          </View>
          <TouchableOpacity onPress={() => onClose()} className="p-3 -mr-3 -mt-3 bg-[#051e06] border border-[#374d34] rounded-full">
            <Text className="text-[#99b292] font-bold leading-none">✕</Text>
          </TouchableOpacity>
        </View>

        {zone.controllingGroup ? (
          <View className="flex-row items-center bg-[#051e06] p-4 rounded-xl border border-[#374d34] mb-6 shadow-sm">
            <View className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: zone.controllingGroup.color }} />
            <View className="flex-1">
              <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest mb-1">Controlled by</Text>
              <Text className="text-[#d5f0cd] font-bold text-lg">{zone.controllingGroup.name}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[#99b292] text-xs uppercase font-bold tracking-widest mb-1">Total AP</Text>
              <Text className="text-[#6bff8f] font-bold text-lg">{zone.controllingGroup.totalAP.toLocaleString()}</Text>
            </View>
          </View>
        ) : (
          <View className="bg-[#051e06] border border-[#374d34] p-4 rounded-xl mb-6 shadow-sm items-center flex-row justify-between">
            <Text className="text-[#99b292] font-semibold flex-1">This zone is neutral and unclaimed!</Text>
            <View className="bg-[#374d34] px-3 py-1.5 rounded-lg">
               <Text className="text-[#d5f0cd] font-bold text-xs uppercase tracking-widest">Neutral</Text>
            </View>
          </View>
        )}

        <Text className="text-[#d5f0cd] font-bold text-lg mb-4">Leaderboard</Text>
        <View className="bg-[#051e06] rounded-xl border border-[#374d34] overflow-hidden mb-8">
          {zone.leaderboard.map((group, index) => (
            <View 
              key={group.groupName} 
              className={`flex-row items-center p-4 ${index !== zone.leaderboard.length - 1 ? 'border-b border-[#374d34]' : ''}`}
            >
              <Text className={`w-8 font-black ${index === 0 ? "text-[#f59e0b] text-xl" : index === 1 ? "text-[#94a3b8] text-lg" : index === 2 ? "text-[#b45309] text-lg" : "text-[#445b41] text-base"}`}>
                #{group.rank}
              </Text>
              <View className="flex-1 ml-2">
                <Text className="text-[#d5f0cd] font-semibold text-base tracking-wide">{group.groupName}</Text>
                <Text className="text-[#99b292] text-xs font-medium mt-0.5">{group.memberCount} members</Text>
              </View>
              <Text className="text-[#6bff8f] font-bold tracking-wide">{group.totalAP.toLocaleString()} AP</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity className="py-4 bg-[#22c55e] border border-[#6bff8f] rounded-xl items-center shadow-lg mb-10">
          <Text className="text-[#002c0f] font-bold text-lg tracking-wide">Join the battle</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}
