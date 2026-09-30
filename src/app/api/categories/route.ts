import { prisma } from "@/lib/prisma";
import { apiSuccess, withErrorHandling } from "@/lib/apiResponse";

// Public endpoint — only returns active categories, with product counts
// so the frontend can gracefully hide empty categories instead of showing dead links.
// Counts (and category membership generally) go through the many-to-many
// ProductCategory link now, so a product assigned to multiple categories is
// correctly counted under every one of them.
export const GET = withErrorHandling(async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { productLinks: { where: { product: { isActive: true } } } } },
    },
  });

  // Only expose categories that currently have at least one active product,
  // per the "don't show empty sections" requirement.
  const visible = categories.filter(
    (c: (typeof categories)[number]) => c._count.productLinks > 0
  );

  return apiSuccess(
    visible.map((c: (typeof categories)[number]) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      _count: { products: c._count.productLinks },
    }))
  );
});
