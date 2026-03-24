import { storeOtp, verifyOtp as verifyStoredOtp } from "../redis";
import { config } from "../config";

/**
 * Generate a random OTP
 */
export function generateOtp(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < config.otpLength; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
}

/**
 * Send OTP via SMS (mock implementation)
 * In production, integrate with MSG91 or Twilio
 */
export async function sendOtp(phoneNumber: string): Promise<{ messageId: string }> {
  const otp = generateOtp();
  
  // Store OTP in Redis
  await storeOtp(phoneNumber, otp);
  
  // In production, send via SMS
  // For development, log the OTP
  if (config.nodeEnv === "development") {
    console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
  }
  
  // TODO: Integrate with SMS provider
  // await smsProvider.send(phoneNumber, `Your FitArena OTP is: ${otp}`);
  
  return {
    messageId: `mock_${Date.now()}`,
  };
}

/**
 * Verify OTP
 */
export async function verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
  // For development, accept "000000" as a bypass
  if (config.nodeEnv === "development" && otp === "000000") {
    return true;
  }
  
  return verifyStoredOtp(phoneNumber, otp);
}
