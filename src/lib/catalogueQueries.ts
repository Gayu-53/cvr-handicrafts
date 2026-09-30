import { prisma } from "@/lib/prisma";

export async function getActiveCategoriesWithProducts() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      // Count via the many-to-many link so categories correctly show a count
      // that includes products assigned to them as a secondary category too,
      // not just their legacy "primary" category.
      _count: { select: { productLinks: { where: { product: { isActive: true } } } } },
    },
  });
  return categories.filter((c: (typeof categories)[number]) => c._count.productLinks > 0);
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });
}

export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isNewArrival: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      specifications: { orderBy: { sortOrder: "asc" } },
      category: true,
      categories: { include: { category: true } },
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      categories: { some: { categoryId } },
      id: { not: excludeId },
    },
    take: limit,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  });
}
