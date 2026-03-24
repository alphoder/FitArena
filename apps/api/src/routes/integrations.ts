import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authMiddleware } from "../middleware/auth";
import { getStravaAuthUrl, exchangeStravaCode, syncStravaHistory } from "../services/strava";
import { config } from "../config";

export async function integrationRoutes(app: FastifyInstance): Promise<void> {
  // Get Strava OAuth URL
  app.get(
    "/api/v1/integrations/strava/auth",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const authUrl = getStravaAuthUrl(userId);

      return reply.send({
        success: true,
        data: { authUrl },
      });
    }
  );

  // Strava OAuth callback
  app.get(
    "/api/v1/integrations/strava/callback",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { code, state: userId, error } = request.query as {
        code?: string;
        state?: string;
        error?: string;
      };

      if (error) {
        // Redirect to app with error
        return reply.redirect(`fitarena://strava/callback?error=${error}`);
      }

      if (!code || !userId) {
        return reply.redirect("fitarena://strava/callback?error=missing_params");
      }

      try {
        await exchangeStravaCode(code, userId);

        // Start historical sync in background
        syncStravaHistory(userId).catch((err) => {
          console.error("Historical sync failed:", err);
        });

        // Redirect to app with success
        return reply.redirect("fitarena://strava/callback?success=true");
      } catch (error) {
        console.error("Strava OAuth error:", error);
        return reply.redirect("fitarena://strava/callback?error=exchange_failed");
      }
    }
  );

  // Sync Strava history manually
  app.post(
    "/api/v1/integrations/strava/sync",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      try {
        const count = await syncStravaHistory(userId);

        return reply.send({
          success: true,
          data: {
            message: `Synced ${count} activities from Strava`,
            count,
          },
        });
      } catch (error) {
        console.error("Strava sync error:", error);
        return reply.status(500).send({
          success: false,
          error: {
            code: "SYNC_FAILED",
            message: "Failed to sync Strava activities",
          },
        });
      }
    }
  );

  // Get Google Fit OAuth URL
  app.get(
    "/api/v1/integrations/google-fit/auth",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      const params = new URLSearchParams({
        client_id: config.googleFit.clientId,
        redirect_uri: config.googleFit.redirectUri,
        response_type: "code",
        scope: [
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.heart_rate.read",
          "https://www.googleapis.com/auth/fitness.location.read",
          "https://www.googleapis.com/auth/fitness.body.read",
        ].join(" "),
        state: userId,
        access_type: "offline",
        prompt: "consent",
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

      return reply.send({
        success: true,
        data: { authUrl },
      });
    }
  );

  // Google Fit OAuth callback
  app.get(
    "/api/v1/integrations/google-fit/callback",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { code, state: userId, error } = request.query as {
        code?: string;
        state?: string;
        error?: string;
      };

      if (error) {
        return reply.redirect(`fitarena://google-fit/callback?error=${error}`);
      }

      if (!code || !userId) {
        return reply.redirect("fitarena://google-fit/callback?error=missing_params");
      }

      // TODO: Implement Google Fit token exchange
      // Similar to Strava flow

      return reply.redirect("fitarena://google-fit/callback?success=true");
    }
  );

  // Get integration status
  app.get(
    "/api/v1/integrations/status",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      // TODO: Check actual token status from database
      // For now, return mock status

      return reply.send({
        success: true,
        data: {
          strava: {
            connected: false,
            lastSync: null,
          },
          googleFit: {
            connected: false,
            lastSync: null,
          },
          terra: {
            connected: false,
            devices: [],
          },
        },
      });
    }
  );

  // Disconnect integration
  app.delete(
    "/api/v1/integrations/:provider",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;
      const { provider } = request.params as { provider: string };

      // TODO: Implement disconnect logic
      // - Delete OAuth tokens
      // - Update user's connection status
      // - Optionally delete synced activities

      return reply.send({
        success: true,
        data: { message: `${provider} disconnected successfully` },
      });
    }
  );
}
