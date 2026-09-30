import { prisma } from "@/lib/prisma";
import { apiSuccess, withErrorHandling } from "@/lib/apiResponse";
import { Prisma } from "@prisma/client";

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const sort = searchParams.get("sort") ?? "featured";
  const featured = searchParams.get("featured");
  const newArrivals = searchParams.get("newArrivals");
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "24");

  const where: Prisma.ProductWhereInput = { isActive: true };

  // A product can belong to multiple categories now, so filtering by category
  // means "this product has a ProductCategory link to a category with this
  // slug" — using `some` naturally avoids duplicates because Prisma still
  // returns each matching Product row once, not once per matching link.
  if (categorySlug) {
    where.categories = { some: { category: { slug: categorySlug } } };
  }
  if (featured === "true") where.isFeatured = true;
  if (newArrivals === "true") where.isNewArrival = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { isFeatured: "desc" };
  switch (sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { isFeatured: "desc" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        category: { select: { name: true, slug: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return apiSuccess({ products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});
