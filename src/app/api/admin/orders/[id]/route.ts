import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";
import { z } from "zod";

const statusEnum = z.enum([
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const GET = withErrorHandling(async (_req: Request, { params }: { params: { id: string } }) => {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, items: { include: { product: true } }, payment: true },
  });
  if (!order) return apiError("Order not found", 404);
  return apiSuccess(order);
});

export const PATCH = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const status = statusEnum.parse(body.status);

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status },
    include: { customer: true, items: true, payment: true },
  });

  return apiSuccess(order);
});
