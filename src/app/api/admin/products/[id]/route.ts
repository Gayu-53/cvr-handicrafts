import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";
import { deleteProductImage } from "@/lib/imageStorage";

export const GET = withErrorHandling(async (_req: Request, { params }: { params: { id: string } }) => {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      categories: { include: { category: true } },
      images: { orderBy: { sortOrder: "asc" } },
      specifications: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) return apiError("Product not found", 404);
  return apiSuccess(product);
});

export const PATCH = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const parsed = productSchema.partial().parse(body);
  const { specifications, categoryIds, ...productData } = parsed;

  const product = await prisma.$transaction(async (tx: typeof prisma) => {
    // Keep legacy Product.categoryId in sync with the first selected category
    // whenever categoryIds is part of this update, so any code still reading
    // the old single-category field keeps working.
    const updateData: typeof productData & { categoryId?: string } = { ...productData };
    if (categoryIds && categoryIds.length > 0) {
      updateData.categoryId = categoryIds[0];
    }

    const updated = await tx.product.update({
      where: { id: params.id },
      data: updateData,
    });

    // Multi-category links are fully replaced on each save, same approach as
    // specifications below — simplest correct way to handle add/remove.
    if (categoryIds) {
      await tx.productCategory.deleteMany({ where: { productId: params.id } });
      if (categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({ productId: params.id, categoryId })),
        });
      }
    }

    // Specifications are fully replaced on each save — this is the simplest
    // correct approach for "add/remove/edit/reorder" dynamic fields and
    // avoids diffing logic that's easy to get wrong.
    if (specifications) {
      await tx.productSpecification.deleteMany({ where: { productId: params.id } });
      if (specifications.length > 0) {
        await tx.productSpecification.createMany({
          data: specifications.map((spec, index) => ({
            productId: params.id,
            label: spec.label,
            value: spec.value,
            sortOrder: spec.sortOrder ?? index,
          })),
        });
      }
    }

    return tx.product.findUnique({
      where: { id: params.id },
      include: {
        specifications: true,
        images: true,
        category: true,
        categories: { include: { category: true } },
      },
    });
  });

  return apiSuccess(product);
});

export const DELETE = withErrorHandling(async (_req: Request, { params }: { params: { id: string } }) => {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!product) return apiError("Product not found", 404);

  // Clean up storage first so we don't orphan files, then remove the DB row
  // (images/specs cascade via onDelete: Cascade in the schema).
  for (const image of product.images) {
    await deleteProductImage(image.storageKey);
  }

  await prisma.product.delete({ where: { id: params.id } });
  return apiSuccess({ deleted: true });
});
