"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search, ImageOff, Package } from "lucide-react";
import { formatINR, getPrimaryImage } from "@/lib/format";
import EmptyState from "@/components/EmptyState";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const json = await res.json();
    if (json.success) setProducts(json.data.products);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also remove its images. This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast.success("Product deleted");
      load();
    } else {
      toast.error(json.error || "Unable to delete product.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-espresso-900">Products</h1>
        <Link href="/admin/products/new" className="btn-gold">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code..."
          className="w-full rounded-full border border-espresso-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-gold-400 focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-espresso-400">Loading...</p>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Products will appear here once they are added"
          description='Click "Add Product" to create your first listing.'
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-espresso-100 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-espresso-100 text-left text-xs uppercase text-espresso-400">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const imageUrl = getPrimaryImage(p.images);
                return (
                  <tr key={p.id} className="border-b border-espresso-50 last:border-none">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-espresso-50">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-4 w-4 text-espresso-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-espresso-900">{p.name}</p>
                          <p className="text-xs text-espresso-400">{p.code || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-espresso-600">{p.category?.name}</td>
                    <td className="px-5 py-3 font-medium text-espresso-800">
                      {formatINR(p.salePrice ?? p.price)}
                      {p.salePrice && (
                        <span className="ml-1.5 text-xs text-espresso-400 line-through">
                          {formatINR(p.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-espresso-600">{p.stockQuantity}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                        {p.isFeatured && <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">Featured</span>}
                        {p.isNewArrival && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">New</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${p.id}`} className="rounded-lg p-2 text-espresso-500 hover:bg-espresso-50">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.name)} className="rounded-lg p-2 text-red-400 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
