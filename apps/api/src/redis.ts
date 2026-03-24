import Redis from "ioredis";
import { config } from "./config";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    if (config.redisUrl) {
      redis = new Redis(config.redisUrl);
    } else {
      // Mock redis for development without Redis
      console.warn("Redis URL not configured, using in-memory store");
      const store = new Map<string, string>();
      redis = {
        get: async (key: string) => store.get(key) || null,
        set: async (key: string, value: string) => {
          store.set(key, value);
          return "OK";
        },
        setex: async (key: string, seconds: number, value: string) => {
          store.set(key, value);
          setTimeout(() => store.delete(key), seconds * 1000);
          return "OK";
        },
        del: async (key: string) => {
          store.delete(key);
          return 1;
        },
        incr: async (key: string) => {
          const val = parseInt(store.get(key) || "0", 10) + 1;
          store.set(key, val.toString());
          return val;
        },
        expire: async (key: string, seconds: number) => {
          setTimeout(() => store.delete(key), seconds * 1000);
          return 1;
        },
      } as unknown as Redis;
    }
  }
  return redis;
}

// OTP storage helpers
export async function storeOtp(phoneNumber: string, otp: string): Promise<void> {
  const redis = getRedis();
  await redis.setex(`otp:${phoneNumber}`, config.otpExpiresIn, otp);
}

export async function verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
  const redis = getRedis();
  const storedOtp = await redis.get(`otp:${phoneNumber}`);
  if (storedOtp === otp) {
    await redis.del(`otp:${phoneNumber}`);
    return true;
  }
  return false;
}

// Token blacklist for logout
export async function blacklistToken(token: string, expiresIn: number): Promise<void> {
  const redis = getRedis();
  await redis.setex(`blacklist:${token}`, expiresIn, "1");
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.get(`blacklist:${token}`);
  return result === "1";
}

// Rate limiting helpers
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const count = await redis.incr(`ratelimit:${key}`);
  
  if (count === 1) {
    await redis.expire(`ratelimit:${key}`, windowSeconds);
  }
  
  return {
    allowed: count <= max,
    remaining: Math.max(0, max - count),
  };
}
