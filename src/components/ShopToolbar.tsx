"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import type { CategoryDTO } from "@/types/catalogue";

export type ShopFilters = {
  category?: string;
  search?: string;
  sort: string;
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

export default function ShopToolbar({
  categories,
  filters,
  onChange,
}: {
  categories: CategoryDTO[];
  filters: ShopFilters;
  onChange: (f: ShopFilters) => void;
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400" />
          <input
            type="text"
            placeholder="Search products or codes..."
            defaultValue={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full rounded-full border border-espresso-200 bg-white py-2.5 pl-10 pr-4 text-sm
              focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-espresso-200 px-4 py-2 text-sm font-medium sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
            className="rounded-full border border-espresso-200 bg-white px-4 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`mt-4 flex-wrap gap-2 sm:flex ${mobileFiltersOpen ? "flex" : "hidden"}`}
      >
        <button
          onClick={() => onChange({ ...filters, category: undefined })}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !filters.category
              ? "bg-espresso-900 text-cream"
              : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange({ ...filters, category: cat.slug })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filters.category === cat.slug
                ? "bg-espresso-900 text-cream"
                : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
