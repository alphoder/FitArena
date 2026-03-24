import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { config } from "../config";
import { processStravaWebhook } from "../services/strava";
import { schemas } from "@fitarena/shared/validation";

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  // Strava webhook verification (GET)
  app.get(
    "/api/v1/webhooks/strava",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = schemas.strava.subscriptionVerify.safeParse(request.query);

      if (!query.success) {
        return reply.status(400).send({ error: "Invalid verification request" });
      }

      const { "hub.verify_token": verifyToken, "hub.challenge": challenge } = query.data;

      if (verifyToken !== config.strava.webhookVerifyToken) {
        return reply.status(403).send({ error: "Invalid verify token" });
      }

      // Respond with challenge to complete subscription
      return reply.send({ "hub.challenge": challenge });
    }
  );

  // Strava webhook events (POST)
  app.post(
    "/api/v1/webhooks/strava",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = schemas.strava.webhook.safeParse(request.body);

      if (!body.success) {
        console.error("Invalid Strava webhook payload:", body.error);
        // Still return 200 to prevent Strava from retrying
        return reply.status(200).send({ received: true });
      }

      // Process webhook asynchronously
      processStravaWebhook(body.data).catch((error) => {
        console.error("Error processing Strava webhook:", error);
      });

      // Respond immediately
      return reply.status(200).send({ received: true });
    }
  );

  // Terra webhook
  app.post(
    "/api/v1/webhooks/terra",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // TODO: Implement Terra webhook handling
      // Terra sends activity and body data from various wearables
      
      console.log("Terra webhook received:", request.body);

      return reply.status(200).send({ received: true });
    }
  );

  // Razorpay webhook (for stake challenges)
  app.post(
    "/api/v1/webhooks/razorpay",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // TODO: Implement Razorpay webhook handling
      // Handle payment.authorized, payment.captured, refund events
      
      console.log("Razorpay webhook received:", request.body);

      return reply.status(200).send({ received: true });
    }
  );

  // WhatsApp webhook
  app.post(
    "/api/v1/webhooks/whatsapp",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // TODO: Implement WhatsApp status callbacks
      // Handle message delivered, read, failed events
      
      console.log("WhatsApp webhook received:", request.body);

      return reply.status(200).send({ received: true });
    }
  );
}
