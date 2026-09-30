"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Save, Trash2 } from "lucide-react";
import ImageUploader, { type ProductImageRow } from "./ImageUploader";
import SpecificationEditor, { type SpecRow } from "./SpecificationEditor";

type Category = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  code: string;
  // A product can belong to multiple categories (client request). The first
  // entry is mirrored to the legacy single categoryId field automatically
  // on save, so nothing else that reads a single category breaks.
  categoryIds: string[];
  // Subcategory is a plain optional text field now — no "None"/"All" dropdown.
  subcategoryLabel: string;
  description: string;
  shortDescription: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
  inStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  specifications: SpecRow[];
  images: ProductImageRow[];
};

const emptyForm: ProductFormValues = {
  name: "",
  code: "",
  categoryIds: [],
  subcategoryLabel: "",
  description: "",
  shortDescription: "",
  price: "",
  salePrice: "",
  stockQuantity: "0",
  inStock: true,
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  specifications: [],
  images: [],
};

export default function ProductForm({ initialValues }: { initialValues?: ProductFormValues }) {
  const router = useRouter();
  const isEditing = !!initialValues?.id;
  const [form, setForm] = useState<ProductFormValues>(initialValues ?? emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleCategory = (categoryId: string) => {
    setForm((f) => {
      const isSelected = f.categoryIds.includes(categoryId);
      return {
        ...f,
        categoryIds: isSelected
          ? f.categoryIds.filter((id) => id !== categoryId)
          : [...f.categoryIds, categoryId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Product name is required");
    if (form.categoryIds.length === 0) return toast.error("Please select at least one category");
    const priceNum = parseFloat(form.price);
    if (!priceNum || priceNum <= 0) return toast.error("Please enter a valid price");

    setSaving(true);

    const payload = {
      name: form.name,
      code: form.code || null,
      categoryIds: form.categoryIds,
      subcategoryLabel: form.subcategoryLabel.trim() || null,
      description: form.description || null,
      shortDescription: form.shortDescription || null,
      price: priceNum,
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      stockQuantity: parseInt(form.stockQuantity || "0", 10),
      inStock: form.inStock,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      specifications: form.specifications.filter((s) => s.label.trim() && s.value.trim()),
    };

    try {
      const url = isEditing ? `/api/admin/products/${initialValues!.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.error || "Unable to save product. Please try again.");
        setSaving(false);
        return;
      }

      toast.success(isEditing ? "Product updated" : "Product created");

      if (!isEditing) {
        // Redirect to the edit page so images can now be uploaded against a real product id.
        router.push(`/admin/products/${json.data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${initialValues!.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Product deleted");
      router.push("/admin/products");
    } else {
      toast.error(json.error || "Unable to delete product.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      {/* Basic Information */}
      <section className="rounded-2xl border border-espresso-100 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-bold text-espresso-900">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Product Name" required>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input-cvr"
            />
          </FormField>
          <FormField label="Product Code">
            <input
              value={form.code}
              onChange={(e) => update("code", e.target.value)}
              placeholder="e.g. DV104"
              className="input-cvr"
            />
          </FormField>

          <FormField label="Subcategory (optional)">
            <input
              value={form.subcategoryLabel}
              onChange={(e) => update("subcategoryLabel", e.target.value)}
              placeholder="e.g. Wall Decor, Krishna, Home Decor"
              className="input-cvr"
            />
          </FormField>

          <FormField label="Price (₹)" required>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="input-cvr"
            />
          </FormField>

          <FormField label="Sale Price (₹, optional)">
            <input
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => update("salePrice", e.target.value)}
              className="input-cvr"
            />
          </FormField>

          <FormField label="Stock Quantity">
            <input
              type="number"
              value={form.stockQuantity}
              onChange={(e) => update("stockQuantity", e.target.value)}
              className="input-cvr"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <span className="mb-1.5 block text-sm font-medium text-espresso-600">
            Categories <span className="text-red-500">*</span>
          </span>
          <p className="mb-2 text-xs text-espresso-400">
            Select every category this product should appear under.
          </p>
          {categories.length === 0 ? (
            <p className="text-sm text-espresso-400">No categories yet — create one first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const checked = form.categoryIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      checked
                        ? "border-gold-400 bg-gold-100 text-gold-700"
                        : "border-espresso-200 text-espresso-500 hover:border-gold-300"
                    }`}
                  >
                    {checked ? "☑" : "☐"} {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4">
          <FormField label="Short Description">
            <input
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              placeholder="One-line summary shown near the price"
              className="input-cvr"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Full Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className="input-cvr"
            />
          </FormField>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-espresso-100 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-bold text-espresso-900">Images</h2>
        {isEditing ? (
          <ImageUploader
            productId={initialValues!.id!}
            images={form.images}
            onChange={(images) => update("images", images)}
          />
        ) : (
          <p className="rounded-lg bg-espresso-50 p-4 text-sm text-espresso-500">
            Save the product first to unlock image uploads.
          </p>
        )}
      </section>

      {/* Specifications */}
      <section className="rounded-2xl border border-espresso-100 bg-white p-6 shadow-card">
        <h2 className="mb-1 font-display text-lg font-bold text-espresso-900">Specifications</h2>
        <p className="mb-4 text-sm text-espresso-400">
          Add whatever fields apply to this product — different products can have completely different specs.
        </p>
        <SpecificationEditor
          specifications={form.specifications}
          onChange={(specs) => update("specifications", specs)}
        />
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-espresso-100 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-bold text-espresso-900">Status</h2>
        <div className="flex flex-wrap gap-6">
          <Toggle label="Active" checked={form.isActive} onChange={(v) => update("isActive", v)} />
          <Toggle label="Featured" checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} />
          <Toggle label="New Arrival" checked={form.isNewArrival} onChange={(v) => update("isNewArrival", v)} />
          <Toggle label="In Stock" checked={form.inStock} onChange={(v) => update("inStock", v)} />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Product
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-full border border-espresso-200 px-6 py-2.5 text-sm font-medium text-espresso-600"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-gold">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Product
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .input-cvr {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #ecdfd2;
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
        }
        .input-cvr:focus {
          outline: none;
          border-color: #dead38;
          box-shadow: 0 0 0 3px rgba(222, 173, 56, 0.15);
        }
      `}</style>
    </form>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-espresso-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-gold-400" : "bg-espresso-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm font-medium text-espresso-700">{label}</span>
    </label>
  );
}
