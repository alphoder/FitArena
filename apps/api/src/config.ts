import "dotenv/config";

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // Redis
  redisUrl: process.env.REDIS_URL!,

  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: "1h",
  refreshTokenExpiresIn: "30d",

  // OTP
  otpExpiresIn: 300, // 5 minutes
  otpLength: 6,

  // Strava
  strava: {
    clientId: process.env.STRAVA_CLIENT_ID!,
    clientSecret: process.env.STRAVA_CLIENT_SECRET!,
    webhookVerifyToken: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || "fitarena_strava_webhook",
    redirectUri: process.env.STRAVA_REDIRECT_URI!,
  },

  // Google Fit
  googleFit: {
    clientId: process.env.GOOGLE_FIT_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_FIT_REDIRECT_URI!,
  },

  // WhatsApp Business API
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL!,
    apiKey: process.env.WHATSAPP_API_KEY!,
    businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER!,
  },

  // Claude AI
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
  },

  // Rate limiting
  rateLimit: {
    max: 60, // requests per minute per user
    timeWindow: 60 * 1000,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3001"],
  },
};

// Validate required env vars
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
