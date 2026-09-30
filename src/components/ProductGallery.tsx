"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ImageOff } from "lucide-react";
import type { ProductImageDTO } from "@/types/catalogue";

export default function ProductGallery({
  images,
  productName,
}: {
  images: ProductImageDTO[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-espresso-50">
        <ImageOff className="h-14 w-14 text-espresso-300" />
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-espresso-50 cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-full w-full"
          >
            <Image
              src={active.url}
              alt={active.altText || productName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className={`object-cover transition-transform duration-500 ${
                isZoomed ? "scale-125" : "scale-100"
              }`}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex ? "border-gold-400" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={img.altText || productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
