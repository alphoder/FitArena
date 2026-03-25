import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../store/auth";

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  // Default to empty string to handle edge cases if opened directly
  const phoneNumber = phone || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const [shake, setShake] = useState(false); 
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  const { verifyOtp, sendOtp } = useAuthStore();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    setError("");
    const newOtp = [...otp];
    const cleanText = text.replace(/[^0-9]/g, "");
    
    // Check if pasting full OTP
    if (cleanText.length === 6) {
      const splitOtp = cleanText.split("");
      setOtp(splitOtp);
      inputRefs.current[5]?.focus();
      checkAndSubmit(splitOtp.join(""));
      return;
    }
    
    // Normal single character input
    newOtp[index] = cleanText.charAt(0);
    setOtp(newOtp);
    
    // Auto advance
    if (cleanText.length > 0 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // If we've just completed the 6 digits through typing
    if (newOtp.join("").length === 6) {
      checkAndSubmit(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const checkAndSubmit = async (code: string) => {
    setIsLoading(true);
    setError("");
    
    const result = await verifyOtp(phoneNumber, code);
    setIsLoading(false);

    if (result.success) {
      if (result.isNew) {
        router.replace("/(auth)/onboarding");
      } else {
        router.replace("/(tabs)/map");
      }
    } else {
      setError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      // Dummy shake state flip that could trigger a reanimated class in the UI
      setShake(prev => !prev);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    if (resendCount >= 3) {
      setError("Too many attempts, try again later");
      return;
    }
    
    setIsLoading(true);
    const success = await sendOtp(phoneNumber);
    setIsLoading(false);
    
    if (success) {
      setCountdown(30);
      setResendCount(prev => prev + 1);
      setError("");
    } else {
      setError("Failed to resend OTP");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#011202]"
    >
      <View className="flex-1 px-8 pt-16">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-12 h-12 items-center justify-center bg-[#0e2c0f] rounded-full border border-[#374d34] mb-8 shadow-sm"
        >
          <Text className="text-[#d5f0cd] text-xl font-bold">←</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-[#d5f0cd] tracking-tight mb-2">
          Verify your number
        </Text>
        <Text className="text-[#99b292] text-base font-medium mb-12 tracking-wide">
          Code sent to +91 {phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, "$1XXXX$3")}
        </Text>

        <View className={`flex-row justify-between mb-2 ${shake ? "opacity-90" : ""}`}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1} 
              selectTextOnFocus
              className={`w-[14%] aspect-[4/5] rounded-xl text-center text-3xl font-bold border 
                ${digit ? "border-[#6bff8f] bg-[#09250a] text-[#d5f0cd]" : "border-[#374d34] bg-[#051e06] text-[#99b292]"}
              `}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-[#ff7351] text-sm text-center mb-6">{error}</Text>
        ) : (
          <View className="mb-6 h-5" />
        )}

        <View className="items-center mt-4">
          <TouchableOpacity 
            onPress={handleResend}
            disabled={countdown > 0 || resendCount >= 3}
            className="py-3 px-6 rounded-full bg-[#051e06] border border-[#374d34] mb-4"
          >
            <Text className={`font-semibold text-base tracking-wide ${countdown > 0 || resendCount >= 3 ? "text-[#445b41]" : "text-[#6bff8f]"}`}>
              {countdown > 0 ? `Resend in 0:${countdown.toString().padStart(2, '0')}` : "Resend OTP"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.back()}
            className="py-2 mt-2 border-b border-[#374d34]"
          >
            <Text className="text-[#99b292] font-medium tracking-wide">
              Change number
            </Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <View className="mt-auto pb-10">
            <Text className="text-center text-[#445b41] text-xs uppercase tracking-widest font-bold">
              Use 000000 to bypass OTP in dev
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
