"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { ProductListItemDTO } from "@/types/catalogue";

export default function ProductShowcaseSection({
  eyebrow,
  title,
  products,
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  products: ProductListItemDTO[];
  viewAllHref: string;
}) {
  // Per requirement: never show an empty section.
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="container-cvr">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-eyebrow">{eyebrow}</span>
            <h2 className="section-heading">{title}</h2>
          </div>
          <motion.div whileHover={{ x: 4 }}>
            <Link
              href={viewAllHref}
              className="flex items-center gap-1.5 text-sm font-semibold text-espresso-700 hover:text-gold-600"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
