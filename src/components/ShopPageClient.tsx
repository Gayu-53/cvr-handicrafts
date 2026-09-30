"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import EmptyState from "@/components/EmptyState";
import ShopToolbar, { type ShopFilters } from "@/components/ShopToolbar";
import { PackageSearch } from "lucide-react";
import type { ProductListItemDTO, CategoryDTO } from "@/types/catalogue";

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [products, setProducts] = useState<ProductListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const filters: ShopFilters = {
    category: searchParams.get("category") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: searchParams.get("sort") ?? "featured",
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => res.success && setCategories(res.data));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.sort) params.set("sort", filters.sort);
    if (searchParams.get("featured") === "true") params.set("featured", "true");
    if (searchParams.get("newArrivals") === "true") params.set("newArrivals", "true");
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products);
        setTotalPages(json.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.search, filters.sort, page, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (next: ShopFilters) => {
    setPage(1);
    const params = new URLSearchParams();
    if (next.category) params.set("category", next.category);
    if (next.search) params.set("search", next.search);
    if (next.sort) params.set("sort", next.sort);
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container-cvr py-10 sm:py-14">
      <div className="mb-8 text-center">
        <span className="section-eyebrow">Our Collection</span>
        <h1 className="section-heading">Shop All Handicrafts</h1>
      </div>

      <ShopToolbar categories={categories} filters={filters} onChange={handleFilterChange} />

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-10 w-10 rounded-full text-sm font-medium transition-colors ${
                    page === i + 1
                      ? "bg-espresso-900 text-cream"
                      : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ShopPageClient() {
  return (
    <Suspense fallback={<div className="container-cvr py-14"><ProductGridSkeleton count={8} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
