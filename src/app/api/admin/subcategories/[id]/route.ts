import { prisma } from "@/lib/prisma";
import { subcategorySchema } from "@/lib/validation";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";

export const PATCH = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const parsed = subcategorySchema.partial().parse(body);

  const subcategory = await prisma.subcategory.update({
    where: { id: params.id },
    data: parsed,
  });

  return apiSuccess(subcategory);
});

export const DELETE = withErrorHandling(async (_req: Request, { params }: { params: { id: string } }) => {
  const productCount = await prisma.product.count({ where: { subcategoryId: params.id } });
  if (productCount > 0) {
    return apiError(
      `Cannot delete this subcategory — it still has ${productCount} product(s) assigned.`,
      409
    );
  }
  await prisma.subcategory.delete({ where: { id: params.id } });
  return apiSuccess({ deleted: true });
});
