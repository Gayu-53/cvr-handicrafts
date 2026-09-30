import { prisma } from "@/lib/prisma";
import { subcategorySchema, slugify } from "@/lib/validation";
import { apiSuccess, withErrorHandling } from "@/lib/apiResponse";

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const subcategories = await prisma.subcategory.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { sortOrder: "asc" },
    include: { category: true, _count: { select: { products: true } } },
  });
  return apiSuccess(subcategories);
});

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const parsed = subcategorySchema.parse(body);

  const baseSlug = slugify(parsed.name);
  let slug = baseSlug;
  let suffix = 1;
  while (
    await prisma.subcategory.findFirst({
      where: { categoryId: parsed.categoryId, slug },
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const subcategory = await prisma.subcategory.create({
    data: { ...parsed, slug },
  });

  return apiSuccess(subcategory, 201);
});
