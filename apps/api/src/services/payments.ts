import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { challenges, challengeParticipants } from "@fitarena/db/schema";
import { config } from "../config";

const RAZORPAY_API = "https://api.razorpay.com/v1";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Create a Razorpay order for a stake challenge entry.
 * Amount is in paise (INR * 100).
 */
export async function createStakeOrder(
  challengeId: string,
  userId: string,
  amountPaise: number
): Promise<{ orderId: string; amount: number; currency: string; keyId: string } | null> {
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const response = await fetch(`${RAZORPAY_API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `stake_${challengeId}_${userId}`,
        notes: {
          challengeId,
          userId,
          type: "stake_entry",
        },
      }),
    });

    if (!response.ok) {
      console.error(`[Razorpay] Order creation failed: ${response.status}`);
      return null;
    }

    const order: RazorpayOrder = await response.json();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error("[Razorpay] Order creation error:", error);
    return null;
  }
}

/**
 * Verify Razorpay payment signature.
 * Called from the Razorpay webhook handler.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Process successful stake payment.
 * Marks the participant as paid and activates their entry.
 */
export async function processStakePayment(
  challengeId: string,
  userId: string,
  paymentId: string,
  orderId: string
): Promise<boolean> {
  try {
    // Update participant record
    await db
      .update(challengeParticipants)
      .set({
        stakePaid: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(challengeParticipants.challengeId, challengeId),
          eq(challengeParticipants.userId, userId)
        )
      );

    console.log(`[Razorpay] Stake paid: challenge=${challengeId}, user=${userId}, payment=${paymentId}`);
    return true;
  } catch (error) {
    console.error("[Razorpay] Payment processing error:", error);
    return false;
  }
}

/**
 * Calculate and distribute winnings for a completed stake challenge.
 * Platform takes platformFeePct (default 15%), rest goes to winner(s).
 */
export async function distributeStakeWinnings(challengeId: string): Promise<{
  totalPool: number;
  platformFee: number;
  winnerPayout: number;
  winnerId: string | null;
}> {
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge || !challenge.stakeAmount) {
    return { totalPool: 0, platformFee: 0, winnerPayout: 0, winnerId: null };
  }

  // Get all paid participants
  const participants = await db.query.challengeParticipants.findMany({
    where: and(
      eq(challengeParticipants.challengeId, challengeId),
      eq(challengeParticipants.stakePaid, true)
    ),
  });

  const totalPool = challenge.stakeAmount * participants.length;
  const platformFeePct = challenge.platformFeePct ?? 15;
  const platformFee = Math.round(totalPool * (platformFeePct / 100));
  const winnerPayout = totalPool - platformFee;

  // Find winner (highest progress who met target)
  const winner = participants
    .filter((p) => p.targetMet)
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];

  if (winner) {
    // Update winner's payout
    await db
      .update(challengeParticipants)
      .set({
        payoutAmount: winnerPayout,
        updatedAt: new Date(),
      })
      .where(eq(challengeParticipants.id, winner.id));

    // TODO: Initiate Razorpay payout/transfer to winner's bank account
    console.log(`[Razorpay] Winner: ${winner.userId}, payout: ₹${(winnerPayout / 100).toFixed(2)}`);
  }

  return {
    totalPool,
    platformFee,
    winnerPayout,
    winnerId: winner?.userId ?? null,
  };
}

/**
 * Process Razorpay webhook event.
 */
export async function processRazorpayWebhook(event: {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string; status: string; notes: Record<string, string> } };
  };
}): Promise<void> {
  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment?.entity;
      if (!payment) return;

      const { challengeId, userId } = payment.notes;
      if (challengeId && userId) {
        await processStakePayment(challengeId, userId, payment.id, payment.order_id);
      }
      break;
    }

    case "payment.failed": {
      const payment = event.payload.payment?.entity;
      console.log(`[Razorpay] Payment failed: ${payment?.id}`);
      break;
    }

    default:
      console.log(`[Razorpay] Unhandled event: ${event.event}`);
  }
}
