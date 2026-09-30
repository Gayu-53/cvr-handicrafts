"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

type CategoryCard = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount: number;
};

export default function CategoryShowcase({ categories }: { categories: CategoryCard[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="container-cvr">
        <div className="mb-12 text-center">
          <span className="section-eyebrow">Shop by Collection</span>
          <h2 className="section-heading">Our Craft Categories</h2>
          <div className="divider-ornament" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block h-64 overflow-hidden rounded-2xl bg-espresso-800 shadow-card"
              >
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-espresso-gradient">
                    <ImageOff className="h-10 w-10 text-gold-300/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl font-bold text-cream">{cat.name}</h3>
                  {cat.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-cream/70">{cat.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gold-200">
                    {cat.productCount} {cat.productCount === 1 ? "piece" : "pieces"}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
