import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../db";
import { users } from "@fitarena/db/schema";
import { eq } from "drizzle-orm";
import { sendOtp, verifyOtp } from "../services/otp";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authMiddleware,
} from "../middleware/auth";
import { blacklistToken } from "../redis";
import { schemas } from "@fitarena/shared/validation";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Send OTP
  app.post("/api/v1/auth/otp/send", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = schemas.auth.sendOtp.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: body.error.flatten(),
        },
      });
    }

    try {
      const result = await sendOtp(body.data.phoneNumber);

      return reply.send({
        success: true,
        data: {
          messageId: result.messageId,
          expiresIn: 300, // 5 minutes
        },
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
      return reply.status(500).send({
        success: false,
        error: {
          code: "OTP_SEND_FAILED",
          message: "Failed to send OTP",
        },
      });
    }
  });

  // Verify OTP
  app.post("/api/v1/auth/otp/verify", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = schemas.auth.verifyOtp.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: body.error.flatten(),
        },
      });
    }

    const { phoneNumber, otp } = body.data;

    const isValid = await verifyOtp(phoneNumber, otp);

    if (!isValid) {
      return reply.status(401).send({
        success: false,
        error: {
          code: "INVALID_OTP",
          message: "Invalid or expired OTP",
        },
      });
    }

    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.phoneNumber, phoneNumber),
    });

    let isNew = false;

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          phoneNumber,
          phoneVerified: true,
          lastActiveAt: new Date(),
        })
        .returning();
      isNew = true;
    } else {
      // Update phone verified and last active
      await db
        .update(users)
        .set({
          phoneVerified: true,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    const tokenPayload = { userId: user.id, phoneNumber };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return reply.send({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          profilePhotoUrl: user.profilePhotoUrl,
          level: user.level,
          xpTotal: user.xpTotal,
          onboardingComplete: user.onboardingComplete,
        },
        isNew,
      },
    });
  });

  // Refresh token
  app.post("/api/v1/auth/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = schemas.auth.refreshToken.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
        },
      });
    }

    try {
      const payload = verifyRefreshToken(body.data.refreshToken);

      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      const tokenPayload = { userId: payload.userId, phoneNumber: payload.phoneNumber };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return reply.send({
        success: true,
        data: {
          token: accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: {
          code: "INVALID_REFRESH_TOKEN",
          message: "Invalid or expired refresh token",
        },
      });
    }
  });

  // Logout
  app.delete(
    "/api/v1/auth/logout",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;
      if (authHeader) {
        const token = authHeader.substring(7);
        // Blacklist token for 1 hour (longer than max token lifetime)
        await blacklistToken(token, 3600);
      }

      return reply.send({
        success: true,
        data: { message: "Logged out successfully" },
      });
    }
  );
}
