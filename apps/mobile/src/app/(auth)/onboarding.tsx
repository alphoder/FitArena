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

const avatars = ["🦍", "🦅", "🐺", "🐯", "🦈", "🦾", "🥋", "🚀"];
const fitnessTypes = ["Gym Goer", "Runner", "Cyclist", "Yoga", "CrossFit", "Mixed"];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [fitnessType, setFitnessType] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { refreshUser } = useAuthStore();

  const handleComplete = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.updateProfile({
        name,
        avatar,
        fitnessType,
        pinCode,
      });

      if (response.success) {
        await refreshUser();
        router.replace("/(tabs)/map");
      } else {
        setError("Failed to save profile. Please try again.");
      }
    } catch (err) {
      setError("Network error. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const TopBar = () => (
    <View className="flex-row items-center mb-6 px-4 mt-2">
      {step > 1 ? (
        <TouchableOpacity 
          onPress={() => setStep(step - 1)}
          className="w-10 h-10 items-center justify-center bg-[#0e2c0f] rounded-full border border-[#374d34] mr-4 shadow-sm"
        >
          <Text className="text-[#d5f0cd] text-xl font-bold">←</Text>
        </TouchableOpacity>
      ) : (
        <View className="w-10 h-10 mr-4" />
      )}
      <View className="flex-1 flex-row gap-2">
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            className={`flex-1 h-1.5 rounded-full ${
              s === step ? "bg-[#6bff8f] shadow-sm shadow-[#6bff8f]/20" : s < step ? "bg-[#0abc56]" : "bg-[#051e06] border border-[#374d34]"
            }`}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#011202]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TopBar />
        
        <ScrollView className="flex-1 px-8">
          {step === 1 && (
            <View className="pb-10">
              <Text className="text-3xl font-bold text-[#d5f0cd] tracking-tight mb-2">
                Setup your profile
              </Text>
              <Text className="text-[#99b292] text-base mb-8">
                This is how other athletes will see you.
              </Text>

              {/* Avatar Selection */}
              <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-4">Choose your avatar</Text>
              <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
                {avatars.map((a) => (
                  <TouchableOpacity
                    key={a}
                    onPress={() => setAvatar(a)}
                    className={`w-[22%] aspect-square items-center justify-center rounded-2xl border ${
                      avatar === a 
                        ? "bg-[#09250a] border-[#6bff8f]" 
                        : "bg-[#051e06] border-[#374d34]"
                    }`}
                  >
                    <Text className="text-3xl">{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Display Name */}
              <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-4">Display Name</Text>
              <View className="bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-8 shadow-sm">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Rahul The Beast"
                  placeholderTextColor="#445b41"
                  maxLength={30}
                  className="px-5 py-4 text-xl text-[#d5f0cd] font-semibold"
                />
              </View>

              {/* Fitness Type */}
              <Text className="text-sm font-semibold text-[#d5f0cd] uppercase tracking-wider mb-4">What describes you best?</Text>
              <View className="flex-row flex-wrap gap-3 mb-8">
                {fitnessTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFitnessType(type)}
                    className={`px-5 py-3 rounded-xl border ${
                      fitnessType === type
                        ? "bg-[#09250a] border-[#6bff8f]"
                        : "bg-[#051e06] border-[#374d34]"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        fitnessType === type ? "text-[#6bff8f]" : "text-[#99b292]"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setStep(2)}
                disabled={name.length < 2 || !fitnessType}
                className={`py-4 mt-2 rounded-xl items-center shadow-lg ${
                  name.length < 2 || !fitnessType
                    ? "bg-[#09250a] border border-[#374d34]"
                    : "bg-[#22C55E] border border-[#6bff8f]"
                }`}
              >
                <Text 
                  className={`font-bold text-lg ${
                    name.length < 2 || !fitnessType ? "text-[#445b41]" : "text-[#002c0f]"
                  }`}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View className="pb-10">
              <Text className="text-3xl font-bold text-[#d5f0cd] tracking-tight mb-2">
                What's your pin code?
              </Text>
              <Text className="text-[#99b292] text-base mb-8">
                This determines your home territory zone.
              </Text>

              <View className="flex-row items-center bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-4 shadow-sm">
                <View className="px-5 py-4 bg-[#051e06] border-r border-[#374d34]">
                  <Text className="text-[#99b292] font-bold text-xl">📍</Text>
                </View>
                <TextInput
                  value={pinCode}
                  onChangeText={(text) => setPinCode(text.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 462016"
                  placeholderTextColor="#445b41"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="flex-1 px-5 py-4 text-2xl text-[#d5f0cd] font-bold tracking-widest leading-none"
                />
              </View>

              {pinCode.length === 6 ? (
                <View className="bg-[#051e06] border border-[#374d34] p-4 rounded-xl mb-8">
                  <Text className="text-[#6bff8f] font-semibold text-base mb-1">
                    ✓ Area Detected: Bhopal, MP
                  </Text>
                  <Text className="text-[#99b292] text-sm">
                    Ready to claim this territory.
                  </Text>
                </View>
              ) : (
                <View className="mb-8 h-[72px]" />
              )}

              <TouchableOpacity
                onPress={() => setStep(3)}
                disabled={pinCode.length !== 6}
                className={`py-4 rounded-xl items-center shadow-lg ${
                  pinCode.length !== 6
                    ? "bg-[#09250a] border border-[#374d34]"
                    : "bg-[#22C55E] border border-[#6bff8f]"
                }`}
              >
                <Text 
                  className={`font-bold text-lg ${
                    pinCode.length !== 6 ? "text-[#445b41]" : "text-[#002c0f]"
                  }`}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View className="pb-10">
              <Text className="text-3xl font-bold text-[#d5f0cd] tracking-tight mb-2">
                Sync your workouts
              </Text>
              <Text className="text-[#99b292] text-base mb-10 leading-relaxed">
                Connect a tracker to earn higher Arena Points for your activity (up to <Text className="text-[#6bff8f] font-bold">1.0x</Text> vs 0.7x for manual logs).
              </Text>

              <TouchableOpacity 
                style={{ backgroundColor: "#fc5200" }}
                className="py-4 rounded-2xl items-center shadow-lg mb-4 flex-row justify-center"
              >
                <Text className="text-white font-extrabold text-lg tracking-wide shrink-0 mr-2">C</Text>
                <Text className="text-white font-semibold text-lg">Connect Strava</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="py-4 rounded-2xl items-center shadow-lg mb-10 border border-[#374d34] bg-[#0e2c0f] flex-row justify-center"
              >
                <Text className="text-[#d5f0cd] font-extrabold text-lg tracking-wide shrink-0 mr-2">G</Text>
                <Text className="text-[#d5f0cd] font-semibold text-lg">Connect Google Fit</Text>
              </TouchableOpacity>

              {error ? (
                <Text className="text-[#ff7351] text-sm text-center mb-4">{error}</Text>
              ) : null}

              <TouchableOpacity
                onPress={handleComplete}
                disabled={isLoading}
                className={`py-4 rounded-xl items-center shadow-lg ${
                  isLoading
                    ? "bg-[#09250a] border border-[#374d34]"
                    : "bg-[#22C55E] border border-[#6bff8f]"
                }`}
              >
                <Text 
                  className={`font-bold text-lg ${
                    isLoading ? "text-[#445b41]" : "text-[#002c0f]"
                  }`}
                >
                  {isLoading ? "Setting up..." : "Continue"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleComplete}
                disabled={isLoading}
                className="py-3 mt-4 items-center"
              >
                <Text className="text-[#99b292] font-semibold text-base border-b border-[#374d34]">
                   I'll log manually
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
