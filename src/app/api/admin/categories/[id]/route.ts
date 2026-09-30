import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";

export const PATCH = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const parsed = categorySchema.partial().parse(body);

  const category = await prisma.category.update({
    where: { id: params.id },
    data: parsed,
  });

  return apiSuccess(category);
});

export const DELETE = withErrorHandling(async (_req: Request, { params }: { params: { id: string } }) => {
  // Count via BOTH the legacy single-category column AND the many-to-many
  // link table, since a product could be attached to this category only as
  // a secondary category (via ProductCategory) without it being their
  // legacy "primary" categoryId. Missing either would let an admin delete a
  // category that's still actively assigned to products, silently
  // untagging them (ProductCategory rows cascade-delete with the category).
  const [legacyCount, linkCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: params.id } }),
    prisma.productCategory.count({ where: { categoryId: params.id } }),
  ]);
  const productCount = Math.max(legacyCount, linkCount);

  if (productCount > 0) {
    return apiError(
      `Cannot delete this category — it still has ${productCount} product(s) assigned. Move or delete those products first.`,
      409
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return apiSuccess({ deleted: true });
});
