import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../store/auth";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendOtp, verifyOtp } = useAuthStore();

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    const success = await sendOtp(phoneNumber);
    setIsLoading(false);

    if (success) {
      setStep("otp");
    } else {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    const result = await verifyOtp(phoneNumber, otp);
    setIsLoading(false);

    if (result.success) {
      if (result.isNew) {
        router.replace("/(auth)/onboarding");
      } else {
        router.replace("/(tabs)/map");
      }
    } else {
      Alert.alert("Error", "Invalid OTP. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-20">
        {/* Logo */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-green-100 rounded-2xl items-center justify-center mb-4">
            <Text className="text-4xl">🏟️</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900">FitArena</Text>
          <Text className="text-gray-600 mt-2 text-center">
            Turn every workout into a territory battle
          </Text>
        </View>

        {step === "phone" ? (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Enter your phone number
            </Text>
            <Text className="text-gray-600 mb-6">
              We'll send you a verification code
            </Text>

            <View className="flex-row items-center border border-gray-300 rounded-xl overflow-hidden mb-6">
              <View className="px-4 py-4 bg-gray-50 border-r border-gray-300">
                <Text className="text-gray-700 font-medium">+91</Text>
              </View>
              <TextInput
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                placeholder="9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                className="flex-1 px-4 py-4 text-lg"
              />
            </View>

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isLoading || phoneNumber.length !== 10}
              className={`py-4 rounded-xl items-center ${
                isLoading || phoneNumber.length !== 10
                  ? "bg-gray-300"
                  : "bg-green-600"
              }`}
            >
              <Text className="text-white font-semibold text-lg">
                {isLoading ? "Sending..." : "Get OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Enter verification code
            </Text>
            <Text className="text-gray-600 mb-6">
              Code sent to +91 {phoneNumber}
            </Text>

            <TextInput
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              className="border border-gray-300 rounded-xl px-4 py-4 text-center text-2xl tracking-widest mb-6"
            />

            <TouchableOpacity
              onPress={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className={`py-4 rounded-xl items-center ${
                isLoading || otp.length !== 6 ? "bg-gray-300" : "bg-green-600"
              }`}
            >
              <Text className="text-white font-semibold text-lg">
                {isLoading ? "Verifying..." : "Verify"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStep("phone");
                setOtp("");
              }}
              className="mt-4 py-2 items-center"
            >
              <Text className="text-green-600 font-medium">Change number</Text>
            </TouchableOpacity>

            {/* Dev bypass hint */}
            <Text className="text-center text-gray-400 text-sm mt-8">
              Use 000000 to bypass OTP in development
            </Text>
          </View>
        )}

        <View className="mt-auto pb-8">
          <Text className="text-center text-gray-500 text-sm">
            By continuing, you agree to our{" "}
            <Text className="text-green-600">Terms of Service</Text> and{" "}
            <Text className="text-green-600">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
