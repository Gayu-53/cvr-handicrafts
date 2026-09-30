"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, ImageOff } from "lucide-react";
import { formatINR, getPrimaryImage } from "@/lib/format";
import { useCartStore } from "@/lib/cartStore";
import type { ProductListItemDTO } from "@/types/catalogue";
import toast from "react-hot-toast";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: ProductListItemDTO;
  index?: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const imageUrl = getPrimaryImage(product.images);
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      code: product.code,
      price,
      salePrice,
      imageUrl,
      maxStock: 99,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="card-cvr overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-espresso-50">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-espresso-300">
                <ImageOff className="h-10 w-10" />
              </div>
            )}

            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.isNewArrival && (
                <span className="rounded-full bg-espresso-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-300">
                  New
                </span>
              )}
              {salePrice && (
                <span className="rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-espresso-900">
                  Sale
                </span>
              )}
              {!product.inStock && (
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Sold Out
                </span>
              )}
            </div>

            <motion.button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              whileTap={{ scale: 0.9 }}
              aria-label="Add to cart"
              className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full
                bg-white text-espresso-900 opacity-0 shadow-md transition-all duration-300
                group-hover:translate-y-0 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
            >
              <ShoppingBag className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="p-4">
            {product.category?.name && (
              <p className="mb-1 text-[11px] uppercase tracking-wide text-espresso-400">
                {product.category.name}
              </p>
            )}
            <h3 className="mb-1.5 line-clamp-1 font-display text-base font-semibold text-espresso-900">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-espresso-800">
                {formatINR(salePrice ?? price)}
              </span>
              {salePrice && (
                <span className="text-sm text-espresso-400 line-through">
                  {formatINR(price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
