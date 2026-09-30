import { prisma } from "@/lib/prisma";
import { apiSuccess, withErrorHandling } from "@/lib/apiResponse";

export const GET = withErrorHandling(async () => {
  const [
    totalProducts,
    activeProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    completedOrders,
    recentOrders,
    revenueAgg,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAYMENT_PENDING"] } } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { customer: true, items: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
  ]);

  return apiSuccess({
    totalProducts,
    activeProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    completedOrders,
    revenue: revenueAgg._sum.total ?? 0,
    recentOrders,
  });
});
