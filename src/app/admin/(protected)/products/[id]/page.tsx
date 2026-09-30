"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setNotFound(true);
          return;
        }
        const p = json.data;
        // Prefer the new many-to-many links; fall back to the legacy single
        // categoryId for any product that hasn't been re-saved since this
        // feature shipped, so old data still shows correctly in the form.
        const categoryIds: string[] =
          p.categories && p.categories.length > 0
            ? p.categories.map((link: any) => link.categoryId ?? link.category?.id)
            : p.categoryId
            ? [p.categoryId]
            : [];

        setInitialValues({
          id: p.id,
          name: p.name,
          code: p.code ?? "",
          categoryIds,
          subcategoryLabel: p.subcategoryLabel ?? "",
          description: p.description ?? "",
          shortDescription: p.shortDescription ?? "",
          price: String(p.price),
          salePrice: p.salePrice ? String(p.salePrice) : "",
          stockQuantity: String(p.stockQuantity),
          inStock: p.inStock,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          specifications: p.specifications.map((s: any) => ({
            label: s.label,
            value: s.value,
            sortOrder: s.sortOrder,
          })),
          images: p.images,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-espresso-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading product...
      </div>
    );
  }

  if (notFound || !initialValues) {
    return <p className="text-espresso-500">Product not found.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-espresso-900">Edit Product</h1>
      <ProductForm initialValues={initialValues} />
    </div>
  );
}
