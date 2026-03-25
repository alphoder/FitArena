import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { groupRoutes } from "./routes/groups";
import { zoneRoutes } from "./routes/zones";
import { activityRoutes } from "./routes/activities";
import { challengeRoutes } from "./routes/challenges";
import { webhookRoutes } from "./routes/webhooks";
import { integrationRoutes } from "./routes/integrations";
import { adminRoutes } from "./routes/admin";
import { startWorkers } from "./workers";
import websocket from "@fastify/websocket";
import { registerRealtimeRoutes } from "./services/realtime";

const app = Fastify({
  logger: {
    level: config.nodeEnv === "development" ? "debug" : "info",
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  // WebSocket
  await app.register(websocket);

  // Rate limiting
  await app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    keyGenerator: (request) => {
      // Use user ID if authenticated, otherwise IP
      return (request as any).user?.userId || request.ip;
    },
  });
}

// Register routes
async function registerRoutes() {
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(groupRoutes);
  await app.register(zoneRoutes);
  await app.register(activityRoutes);
  await app.register(challengeRoutes);
  await app.register(webhookRoutes);
  await app.register(integrationRoutes);
  await app.register(adminRoutes);
  await registerRealtimeRoutes(app);
}

// Health check
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// API info
app.get("/", async () => {
  return {
    name: "FitArena API",
    version: "0.1.0",
    description: "Competitive fitness platform with territory control",
  };
});

// Global error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.validation,
      },
    });
  }

  // Handle rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
      },
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: config.nodeEnv === "development" ? error.message : "An error occurred",
    },
  });
});

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    // Start BullMQ workers after server is listening
    await startWorkers();

    console.log(`
    🏟️  FitArena API is running!
    
    Environment: ${config.nodeEnv}
    Server:      http://${config.host}:${config.port}
    Health:      http://${config.host}:${config.port}/health
    
    Ready to accept connections...
    `);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
const signals = ["SIGINT", "SIGTERM"] as const;

for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  });
}

start();
