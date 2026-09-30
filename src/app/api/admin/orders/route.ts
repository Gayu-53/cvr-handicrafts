import { prisma } from "@/lib/prisma";
import { apiSuccess, withErrorHandling } from "@/lib/apiResponse";

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: true,
        items: true,
        payment: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return apiSuccess({ orders, total, page, pageSize });
});
