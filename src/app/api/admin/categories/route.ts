import { prisma } from "@/lib/prisma";
import { categorySchema, slugify } from "@/lib/validation";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";

export const GET = withErrorHandling(async () => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: { orderBy: { sortOrder: "asc" } },
      _count: { select: { products: true } },
    },
  });
  return apiSuccess(categories);
});

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const parsed = categorySchema.parse(body);

  const baseSlug = slugify(parsed.name);
  let slug = baseSlug;
  let suffix = 1;
  // Ensure slug uniqueness so two categories with the same name don't collide.
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });

  const category = await prisma.category.create({
    data: {
      ...parsed,
      slug,
      sortOrder: parsed.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return apiSuccess(category, 201);
});
