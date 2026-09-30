import { getSupabaseAdmin } from "./supabase";
import { randomUUID } from "crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class ImageValidationError extends Error {}

/**
 * Validates a file before it ever touches storage.
 * Throws ImageValidationError with a message safe to show the admin.
 */
export function validateImageFile(file: { type: string; size: number; name: string }) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ImageValidationError(
      `"${file.name}" is not a supported image type. Please upload JPG, PNG, WEBP, or GIF files only.`
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ImageValidationError(
      `"${file.name}" is too large (max 5MB). Please compress the image and try again.`
    );
  }
  if (file.size === 0) {
    throw new ImageValidationError(`"${file.name}" appears to be empty or corrupted.`);
  }
}

/**
 * Uploads a single image buffer to persistent Supabase Storage and returns
 * the PUBLIC URL + storage key. This is the ONLY function that should ever
 * write an image reference destined for the database — callers must store
 * the returned `url`, never a local/temp path.
 */
export async function uploadProductImage(params: {
  productId: string;
  fileBuffer: Buffer;
  contentType: string;
  originalName: string;
}): Promise<{ url: string; storageKey: string }> {
  const supabase = getSupabaseAdmin();

  const extension = params.originalName.split(".").pop()?.toLowerCase() || "jpg";
  const storageKey = `products/${params.productId}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, params.fileBuffer, {
      contentType: params.contentType,
      upsert: false,
      cacheControl: "31536000", // 1 year, images are content-addressed by UUID so safe to cache hard
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storageKey);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Image was uploaded but a public URL could not be generated.");
  }

  return { url: publicUrlData.publicUrl, storageKey };
}

/**
 * Deletes an image from persistent storage using its storage key.
 * Called whenever a ProductImage row is deleted or replaced, so storage
 * doesn't silently accumulate orphaned files.
 */
export async function deleteProductImage(storageKey: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([storageKey]);
  if (error) {
    // Non-fatal: log but don't block the DB operation on a storage cleanup failure.
    console.error(`Failed to delete storage object ${storageKey}:`, error.message);
  }
}

/**
 * Category images are a SEPARATE image system from product images (per requirement:
 * do not overwrite product images when changing a category image, and vice versa).
 * This reuses the same Supabase bucket and validation, just a different storage
 * path prefix ("categories/..." vs "products/...") so the two never collide.
 */
export async function uploadCategoryImage(params: {
  categoryId: string;
  fileBuffer: Buffer;
  contentType: string;
  originalName: string;
}): Promise<{ url: string; storageKey: string }> {
  const supabase = getSupabaseAdmin();

  const extension = params.originalName.split(".").pop()?.toLowerCase() || "jpg";
  const storageKey = `categories/${params.categoryId}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, params.fileBuffer, {
      contentType: params.contentType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) {
    throw new Error(`Category image upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storageKey);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Image was uploaded but a public URL could not be generated.");
  }

  return { url: publicUrlData.publicUrl, storageKey };
}

/**
 * Deletes a category image from persistent storage. Same pattern as
 * deleteProductImage but kept separate for clarity and independent evolution.
 */
export async function deleteCategoryImage(storageKey: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove([storageKey]);
  if (error) {
    console.error(`Failed to delete category storage object ${storageKey}:`, error.message);
  }
}
