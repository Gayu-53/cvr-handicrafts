export type ProductImageDTO = {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductSpecDTO = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
};

export type ProductListItemDTO = {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  price: number | string;
  salePrice?: number | string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  inStock: boolean;
  images: ProductImageDTO[];
  category?: { name: string; slug: string } | null;
  // Free-text subcategory label (client request: plain optional field, no
  // dropdown of "None"/"All"). Replaces the old Subcategory relation on the
  // storefront; the relation itself is kept in the schema only for legacy data.
  subcategoryLabel?: string | null;
  // Multi-category links (a product can belong to more than one category).
  categories?: { category: { id: string; name: string; slug: string } }[];
};

export type ProductDetailDTO = ProductListItemDTO & {
  description?: string | null;
  shortDescription?: string | null;
  stockQuantity: number;
  specifications: ProductSpecDTO[];
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  _count: { products: number };
};
