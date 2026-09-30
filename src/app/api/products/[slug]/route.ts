import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";

export const GET = withErrorHandling(async (_req: Request, { params }: { params: { slug: string } }) => {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      specifications: { orderBy: { sortOrder: "asc" } },
      category: true,
      categories: { include: { category: true } },
    },
  });

  if (!product) return apiError("Product not found", 404);

  // Related products: match on any of this product's categories, not just
  // the legacy primary one, so multi-category products get better matches.
  const relatedCategoryIds =
    product.categories.length > 0
      ? product.categories.map((link: (typeof product.categories)[number]) => link.categoryId)
      : [product.categoryId];

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categories: { some: { categoryId: { in: relatedCategoryIds } } },
      id: { not: product.id },
    },
    take: 4,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });

  return apiSuccess({ product, related });
});
