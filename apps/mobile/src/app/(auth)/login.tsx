import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../store/auth";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { sendOtp } = useAuthStore();

  const handleSendOtp = async () => {
    setError("");
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    const success = await sendOtp(phoneNumber);
    setIsLoading(false);

    if (success) {
      router.push({
        pathname: "/(auth)/verify",
        params: { phone: phoneNumber }
      });
    } else {
      setError("Failed to send OTP. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#011202]"
    >
      <View className="flex-1 px-8 pt-24">
        {/* Logo Section */}
        <View className="items-center mb-16 mt-8">
          <View className="w-24 h-24 bg-[#0e2c0f] rounded-2xl items-center justify-center mb-6 border border-[#374d34] shadow-lg shadow-[#6bff8f]/10">
            <Text className="text-5xl">🛡️</Text>
          </View>
          <Text className="text-4xl font-bold text-[#d5f0cd] tracking-tight">FitArena</Text>
          <Text className="text-[#99b292] mt-3 text-center text-lg font-medium">
            Turn every workout into a territory battle
          </Text>
          <Text className="text-[#6bff8f] font-bold mt-2 text-center text-base tracking-wide">
            Which group owns YOUR neighborhood?
          </Text>
        </View>

        {/* Input Section */}
        <View className="mt-8">
          <Text className="text-base font-medium text-[#d5f0cd] mb-3">
            Enter your phone number
          </Text>

          <View className="flex-row items-center bg-[#0e2c0f] border border-[#374d34] rounded-xl overflow-hidden mb-2 shadow-sm">
            <View className="px-5 py-4 bg-[#051e06] border-r border-[#374d34]">
              <Text className="text-[#99b292] font-bold text-lg">+91</Text>
            </View>
            <TextInput
              value={phoneNumber}
              onChangeText={(text) => {
                setError("");
                setPhoneNumber(text.replace(/[^0-9]/g, ""));
              }}
              placeholder="9876543210"
              placeholderTextColor="#445b41"
              keyboardType="phone-pad"
              maxLength={10}
              className="flex-1 px-5 py-4 text-xl text-[#d5f0cd] font-semibold"
            />
          </View>
          
          {error ? (
            <Text className="text-[#ff7351] text-sm mb-4 ml-1">{error}</Text>
          ) : (
            <View className="mb-4 h-5" />
          )}

          <TouchableOpacity
            onPress={handleSendOtp}
            disabled={isLoading || phoneNumber.length !== 10}
            className={`py-4 rounded-xl items-center shadow-lg ${
              isLoading || phoneNumber.length !== 10
                ? "bg-[#09250a] border border-[#374d34]"
                : "bg-[#22C55E] border border-[#6bff8f]"
            }`}
          >
            <Text 
              className={`font-bold text-lg ${
                isLoading || phoneNumber.length !== 10 ? "text-[#445b41]" : "text-[#002c0f]"
              }`}
            >
              {isLoading ? "Sending..." : "Get OTP"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-auto pb-10">
          <Text className="text-center text-[#99b292] text-xs">
            By continuing, you agree to our{" "}
            <Text className="text-[#6bff8f] font-medium">Terms of Service</Text> and{" "}
            <Text className="text-[#6bff8f] font-medium">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
