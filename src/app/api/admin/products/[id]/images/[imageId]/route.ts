import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";
import { deleteProductImage } from "@/lib/imageStorage";

type Ctx = { params: { id: string; imageId: string } };

// Set as primary image, or update sortOrder (used for drag-to-reorder).
export const PATCH = withErrorHandling(async (req: Request, { params }: Ctx) => {
  const body = await req.json();

  if (body.setPrimary) {
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId: params.id },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: params.imageId },
        data: { isPrimary: true },
      }),
    ]);
  }

  if (typeof body.sortOrder === "number") {
    await prisma.productImage.update({
      where: { id: params.imageId },
      data: { sortOrder: body.sortOrder },
    });
  }

  const updated = await prisma.productImage.findUnique({ where: { id: params.imageId } });
  return apiSuccess(updated);
});

// Deletes from persistent storage AND the database row, so the customer
// website immediately stops displaying it and storage doesn't accumulate junk.
export const DELETE = withErrorHandling(async (_req: Request, { params }: Ctx) => {
  const image = await prisma.productImage.findUnique({ where: { id: params.imageId } });
  if (!image) return apiError("Image not found", 404);

  await deleteProductImage(image.storageKey);
  await prisma.productImage.delete({ where: { id: params.imageId } });

  // If we just deleted the primary image, promote the next one automatically
  // so the product never ends up with zero primary images while images still exist.
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: params.id },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  return apiSuccess({ deleted: true });
});
