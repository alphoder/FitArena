import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { isTokenBlacklisted } from "../redis";

export interface JwtPayload {
  userId: string;
  phoneNumber: string;
  iat: number;
  exp: number;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header",
      },
    });
  }

  const token = authHeader.substring(7);

  try {
    // Check if token is blacklisted
    if (await isTokenBlacklisted(token)) {
      return reply.status(401).send({
        success: false,
        error: {
          code: "TOKEN_REVOKED",
          message: "Token has been revoked",
        },
      });
    }

    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    request.user = payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Token has expired",
        },
      });
    }

    return reply.status(401).send({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
  }
}

export function generateAccessToken(payload: { userId: string; phoneNumber: string }): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function generateRefreshToken(payload: { userId: string; phoneNumber: string }): string {
  return jwt.sign({ ...payload, type: "refresh" }, config.jwtSecret, {
    expiresIn: config.refreshTokenExpiresIn,
  });
}

export function verifyRefreshToken(token: string): JwtPayload & { type: string } {
  return jwt.verify(token, config.jwtSecret) as JwtPayload & { type: string };
}
