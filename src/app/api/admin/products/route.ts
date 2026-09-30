import { prisma } from "@/lib/prisma";
import { productSchema, slugify } from "@/lib/validation";
import { apiSuccess, withErrorHandling } from "@/lib/apiResponse";

export const GET = withErrorHandling(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        categories: { include: { category: true } },
        images: { orderBy: { sortOrder: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return apiSuccess({ products, total, page, pageSize });
});

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json();
  const parsed = productSchema.parse(body);

  const baseSlug = slugify(parsed.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const { specifications, categoryIds, ...productData } = parsed;

  // Keep legacy categoryId in sync with the first selected category so any
  // existing code still reading Product.categoryId/category keeps working.
  const primaryCategoryId = categoryIds[0];

  const product = await prisma.product.create({
    data: {
      ...productData,
      categoryId: primaryCategoryId,
      slug,
      specifications: {
        create: specifications.map((spec, index) => ({
          label: spec.label,
          value: spec.value,
          sortOrder: spec.sortOrder ?? index,
        })),
      },
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
    include: {
      specifications: true,
      images: true,
      category: true,
      subcategory: true,
      categories: { include: { category: true } },
    },
  });

  return apiSuccess(product, 201);
});
