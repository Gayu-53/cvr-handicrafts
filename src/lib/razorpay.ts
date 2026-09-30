import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured in environment variables.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Verifies the HMAC signature Razorpay returns after checkout completes.
 * This MUST happen server-side — the frontend "payment success" callback
 * is never trusted on its own, per Razorpay's own security guidance.
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return expected === params.signature;
}

/**
 * Verifies a webhook payload signature (separate secret configured in the
 * Razorpay dashboard). Used so we correctly handle async/duplicate webhook
 * callbacks instead of relying solely on the client-side redirect.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
