import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, withErrorHandling } from "@/lib/apiResponse";
import { uploadProductImage, validateImageFile, ImageValidationError } from "@/lib/imageStorage";

/**
 * Upload flow (per the project's critical requirement):
 * Admin browser --(multipart FormData)--> this route
 *   -> validate file
 *   -> upload buffer to Supabase Storage (persistent)
 *   -> store the returned PUBLIC URL + storageKey in ProductImage row
 *   -> respond with the saved row (customer site will read this from DB, not from any local path)
 */
export const POST = withErrorHandling(async (req: Request, { params }: { params: { id: string } }) => {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return apiError("Product not found", 404);

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

  const { url, storageKey } = await uploadProductImage({
    productId: params.id,
    fileBuffer: buffer,
    contentType: file.type,
    originalName: file.name,
  });

  const existingCount = await prisma.productImage.count({ where: { productId: params.id } });

  const image = await prisma.productImage.create({
    data: {
      productId: params.id,
      url,
      storageKey,
      altText: product.name,
      isPrimary: existingCount === 0, // first image uploaded becomes primary automatically
      sortOrder: existingCount,
    },
  });

  return apiSuccess(image, 201);
});

export const GET = withErrorHandling(async (_req: Request, { params }: { params: { id: string } }) => {
  const images = await prisma.productImage.findMany({
    where: { productId: params.id },
    orderBy: { sortOrder: "asc" },
  });
  return apiSuccess(images);
});
