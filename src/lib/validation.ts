import { z } from "zod";

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metaTitle: z.string().max(160).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
});

export const subcategorySchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const specificationSchema = z.object({
  label: z.string().min(1, "Specification name is required").max(60),
  value: z.string().min(1, "Specification value is required").max(200),
  sortOrder: z.number().int().default(0),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(200),
  code: z.string().max(60).optional().nullable(),
  // Legacy single categoryId kept for backward compatibility (mirrors the first
  // entry of categoryIds). New code should read/write categoryIds instead.
  categoryId: z.string().min(1, "Category is required"),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  // Subcategory is now free text (client request) instead of a foreign key.
  subcategoryId: z.string().optional().nullable(),
  subcategoryLabel: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(300).optional().nullable(),
  price: z.number().positive("Price must be greater than 0"),
  salePrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  metaTitle: z.string().max(160).optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  specifications: z.array(specificationSchema).default([]),
});

export const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  email: z.string().email().optional().or(z.literal("")),
  addressLine: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Enter a valid pincode").max(10),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
