import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";
import {
  uploadCategoryImage,
  deleteCategoryImage,
  validateImageFile,
  ImageValidationError,
} from "@/lib/imageStorage";

/**
 * Upload (or replace) a category's image.
 * Flow mirrors the existing product image upload exactly:
 * validate -> upload to Supabase Storage -> store public URL + storage key on the Category row.
 * If the category already had an image, the old storage object is deleted so
 * storage doesn't accumulate orphaned files, and the two systems never collide
 * because category files live under "categories/" while product files live
 * under "products/" in the same bucket.
 */
export const POST = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) return apiError("Category not found", 404);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return apiError("No file was received. Please choose an image and try again.", 400);
  }

  try {
    validateImageFile({ type: file.type, size: file.size, name: file.name });
  } catch (err) {
    if (err instanceof ImageValidationError) {
      return apiError(err.message, 422);
    }
    throw err;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { url, storageKey } = await uploadCategoryImage({
    categoryId: params.id,
    fileBuffer: buffer,
    contentType: file.type,
    originalName: file.name,
  });

  // Clean up the previous image (if any) now that the new one is safely uploaded.
  const previousStorageKey = category.imageStorageKey;

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: { imageUrl: url, imageStorageKey: storageKey },
  });

  if (previousStorageKey) {
    await deleteCategoryImage(previousStorageKey);
  }

  return apiSuccess(updated, 201);
});

export const DELETE = withErrorHandling(async (_req: Request, { params }: { params: { id: string } }) => {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) return apiError("Category not found", 404);

  if (category.imageStorageKey) {
    await deleteCategoryImage(category.imageStorageKey);
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: { imageUrl: null, imageStorageKey: null },
  });

  return apiSuccess(updated);
});
