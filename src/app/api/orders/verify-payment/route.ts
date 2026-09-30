import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const parsed = schema.parse(body);

  const isValid = verifyRazorpaySignature({
    orderId: parsed.razorpay_order_id,
    paymentId: parsed.razorpay_payment_id,
    signature: parsed.razorpay_signature,
  });

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: parsed.razorpay_order_id },
    include: { order: { include: { customer: true } } },
  });

  if (!payment) return apiError("Payment record not found.", 404);

  // Idempotency: if we've already marked this successful (e.g. webhook beat us to it),
  // don't process it twice.
  if (payment.status === "SUCCESS") {
    return apiSuccess({ orderNumber: payment.order.orderNumber, alreadyProcessed: true });
  }

  if (!isValid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return apiError("Payment verification failed. Please contact support if you were charged.", 400);
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        razorpayPaymentId: parsed.razorpay_payment_id,
        razorpaySignature: parsed.razorpay_signature,
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    }),
  ]);

  // Decrement stock now that payment is confirmed.
  const items = await prisma.orderItem.findMany({ where: { orderId: payment.orderId } });
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }

  // Send the client a notification email now that payment is confirmed.
  // This is intentionally best-effort: a failure here must NOT change the
  // response we send back, since the payment itself already succeeded.
  // notificationSent guards against sending twice if this endpoint and the
  // webhook both fire for the same payment.
  try {
    const result = await sendOrderConfirmationEmail({
      orderNumber: payment.order.orderNumber,
      total: Number(payment.order.total),
      customerName: payment.order.customer.name,
    });
    if (result.sent) {
      await prisma.payment.update({ where: { id: payment.id }, data: { notificationSent: true } });
    }
  } catch (err) {
    console.error("Order confirmation email failed (payment remains successful):", err);
  }

  return apiSuccess({ orderNumber: payment.order.orderNumber, alreadyProcessed: false });
});
