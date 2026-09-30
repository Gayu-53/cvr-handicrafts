"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  FolderTree,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";

type Subcategory = { id: string; name: string; slug: string; isActive: boolean };
type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  subcategories: Subcategory[];
  _count: { products: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<null | { type: "category" | "subcategory"; categoryId?: string; editing?: any }>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Category deleted");
      load();
    } else {
      toast.error(json.error);
    }
  };

  const deleteSubcategory = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Subcategory deleted");
      load();
    } else {
      toast.error(json.error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-espresso-900">Categories</h1>
        <button onClick={() => setModal({ type: "category" })} className="btn-gold">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-espresso-400">Loading...</p>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description='Click "Add Category" to create your first one — e.g. Statues, Buddha, Tanjore.'
        />
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-espresso-100 bg-white shadow-card">
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  onClick={() => setExpanded((e) => ({ ...e, [cat.id]: !e[cat.id] }))}
                  className="flex items-center gap-3 text-left"
                >
                  {expanded[cat.id] ? (
                    <ChevronDown className="h-4 w-4 text-espresso-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-espresso-400" />
                  )}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-espresso-50">
                    {cat.imageUrl ? (
                      <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-espresso-300">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-espresso-900">{cat.name}</p>
                    <p className="text-xs text-espresso-400">
                      {cat._count.products} product(s) · {cat.subcategories.length} subcategor{cat.subcategories.length === 1 ? "y" : "ies"}
                      {!cat.isActive && " · Inactive"}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal({ type: "subcategory", categoryId: cat.id })}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gold-600 hover:bg-gold-50"
                  >
                    + Subcategory
                  </button>
                  <button
                    onClick={() => setModal({ type: "category", editing: cat })}
                    className="rounded-lg p-2 text-espresso-500 hover:bg-espresso-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded[cat.id] && cat.subcategories.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-espresso-50"
                  >
                    <ul className="divide-y divide-espresso-50 px-5">
                      {cat.subcategories.map((sub) => (
                        <li key={sub.id} className="flex items-center justify-between py-3 pl-6">
                          <span className="text-sm text-espresso-700">
                            {sub.name} {!sub.isActive && <span className="text-espresso-300">(inactive)</span>}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setModal({ type: "subcategory", categoryId: cat.id, editing: sub })}
                              className="rounded p-1.5 text-espresso-400 hover:bg-espresso-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSubcategory(sub.id)}
                              className="rounded p-1.5 text-red-400 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <CategoryModal
            modal={modal}
            categories={categories}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryModal({
  modal,
  categories,
  onClose,
  onSaved,
}: {
  modal: { type: "category" | "subcategory"; categoryId?: string; editing?: any };
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!modal.editing;
  const [name, setName] = useState(modal.editing?.name ?? "");
  const [description, setDescription] = useState(modal.editing?.description ?? "");
  const [categoryId, setCategoryId] = useState(modal.categoryId ?? categories[0]?.id ?? "");
  const [isActive, setIsActive] = useState(modal.editing?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState<string | null>(modal.editing?.imageUrl ?? null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCategory = modal.type === "category";

  // Category images can only be uploaded once the category exists (we need a
  // real id to build the storage path), same pattern as product images.
  const handleImageSelect = async (file: File) => {
    if (!isEditing) {
      toast.error("Please save the category first, then add an image.");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Please choose a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5MB).");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/admin/categories/${modal.editing.id}/images`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setImageUrl(json.data.imageUrl);
        toast.success("Category image updated");
      } else {
        toast.error(json.error || "Image upload failed. Please try again.");
      }
    } catch {
      toast.error("Network error during upload. Please try again.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!isEditing) return;
    if (!confirm("Remove this category's image?")) return;
    const res = await fetch(`/api/admin/categories/${modal.editing.id}/images`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      setImageUrl(null);
      toast.success("Image removed");
    } else {
      toast.error(json.error || "Unable to remove image.");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);

    const url = isEditing
      ? isCategory
        ? `/api/admin/categories/${modal.editing.id}`
        : `/api/admin/subcategories/${modal.editing.id}`
      : isCategory
      ? "/api/admin/categories"
      : "/api/admin/subcategories";

    const body = isCategory
      ? { name, description, isActive }
      : { name, description, isActive, categoryId };

    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);

    if (json.success) {
      toast.success(isEditing ? "Updated successfully" : "Created successfully");
      onSaved();
    } else {
      toast.error(json.error || "Unable to save. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-espresso-900">
            {isEditing ? "Edit" : "Add"} {modal.type === "category" ? "Category" : "Subcategory"}
          </h2>
          <button onClick={onClose}><X className="h-5 w-5 text-espresso-400" /></button>
        </div>

        <div className="space-y-4">
          {modal.type === "subcategory" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-espresso-600">Parent Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-espresso-200 px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-espresso-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
              placeholder="e.g. Statues"
            />
          </div>

          {isCategory && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-espresso-600">
                Category Image (optional)
              </label>
              {!isEditing ? (
                <p className="rounded-lg bg-espresso-50 p-3 text-xs text-espresso-500">
                  Save the category first, then come back to add an image.
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-espresso-200 bg-espresso-50">
                    {imageUrl ? (
                      <Image src={imageUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-espresso-300">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full border border-gold-300 px-3 py-1.5 text-xs font-medium text-gold-600 hover:bg-gold-50 disabled:opacity-50"
                    >
                      {uploadingImage ? "Uploading..." : imageUrl ? "Replace Image" : "Upload Image"}
                    </button>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-espresso-600">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-espresso-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-espresso-600">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible on website)
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-espresso-200 py-2.5 text-sm font-medium text-espresso-600">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-gold flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
