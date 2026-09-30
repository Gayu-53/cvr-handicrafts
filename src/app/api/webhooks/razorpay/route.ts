import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

/**
 * Razorpay webhook — the authoritative, server-to-server source of truth for
 * payment status. Runs independently of whether the customer's browser stayed
 * on the page after paying, and is idempotent so duplicate deliveries (which
 * Razorpay explicitly warns can happen) don't double-process an order.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event;

  try {
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const razorpayOrderId = event.payload?.payment?.entity?.order_id;
      const razorpayPaymentId = event.payload?.payment?.entity?.id;
      if (!razorpayOrderId) return NextResponse.json({ received: true });

      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: { order: { include: { customer: true } } },
      });
      if (!payment) return NextResponse.json({ received: true });

      if (payment.status !== "SUCCESS") {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "SUCCESS",
              razorpayPaymentId,
              rawWebhookPayload: event,
            },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
          }),
        ]);
      }

      // notificationSent guards this: if the browser-side verify-payment call
      // already sent the email for this payment, we don't send it again here,
      // and vice versa — whichever path reaches SUCCESS first sends the email.
      if (!payment.notificationSent) {
        try {
          const result = await sendOrderConfirmationEmail({
            orderNumber: payment.order.orderNumber,
            total: Number(payment.order.total),
            customerName: payment.order.customer.name,
          });
          if (result.sent) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { notificationSent: true },
            });
          }
        } catch (err) {
          console.error("Order confirmation email failed (webhook path):", err);
        }
      }
    }

    if (eventType === "payment.failed") {
      const razorpayOrderId = event.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        const payment = await prisma.payment.findUnique({ where: { razorpayOrderId } });
        if (payment && payment.status !== "SUCCESS") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", rawWebhookPayload: event },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Still return 200 to prevent Razorpay retry storms once we've logged it;
    // adjust to 500 if you'd rather rely on their retry mechanism.
    return NextResponse.json({ received: true, note: "logged error" });
  }
}
