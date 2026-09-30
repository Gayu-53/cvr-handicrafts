"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Upload, Star, Trash2, Loader2, GripVertical, ImageOff } from "lucide-react";

export type ProductImageRow = {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUploader({
  productId,
  images,
  onChange,
}: {
  productId: string;
  images: ProductImageRow[];
  onChange: (images: ProductImageRow[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported image type (use JPG, PNG, WEBP or GIF).`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/admin/products/${productId}/images`, {
          method: "POST",
          body: formData,
        });
        const json = await res.json();

        if (json.success) {
          onChange([...images, json.data]);
        } else {
          toast.error(json.error || "Image upload failed. Please try again.");
        }
      } catch {
        toast.error("Network error during upload. Please check your connection and try again.");
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        onChange(images.filter((img) => img.id !== imageId));
        toast.success("Image deleted");
      } else {
        toast.error(json.error || "Unable to delete image.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setPrimary: true }),
      });
      const json = await res.json();
      if (json.success) {
        onChange(images.map((img) => ({ ...img, isPrimary: img.id === imageId })));
      } else {
        toast.error(json.error || "Unable to set primary image.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-colors ${
          dragActive ? "border-gold-400 bg-gold-50" : "border-espresso-200 hover:border-gold-300"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-gold-500" />
            <p className="text-sm text-espresso-500">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-espresso-300" />
            <p className="text-sm font-medium text-espresso-600">Click or drag images to upload</p>
            <p className="mt-1 text-xs text-espresso-400">JPG, PNG, WEBP or GIF · Max {MAX_SIZE_MB}MB each</p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img) => (
              <div
                key={img.id}
                className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${
                  img.isPrimary ? "border-gold-400" : "border-espresso-100"
                }`}
              >
                {img.url ? (
                  <Image src={img.url} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-espresso-50">
                    <ImageOff className="h-6 w-6 text-espresso-300" />
                  </div>
                )}

                {img.isPrimary && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-gold-gradient p-1">
                    <Star className="h-3 w-3 fill-espresso-900 text-espresso-900" />
                  </span>
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(img.id)}
                      title="Set as primary"
                      className="rounded-full bg-white p-1.5 text-espresso-700 hover:bg-gold-100"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    title="Delete image"
                    className="rounded-full bg-white p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="mt-3 text-xs text-espresso-400">
          No images yet. The first image you upload will automatically become the primary image.
        </p>
      )}
    </div>
  );
}
