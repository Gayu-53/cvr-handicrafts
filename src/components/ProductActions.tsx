"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/cartStore";
import { formatINR } from "@/lib/format";
import { getWhatsappLink } from "@/lib/siteConfig";
import type { ProductDetailDTO } from "@/types/catalogue";

export default function ProductActions({ product }: { product: ProductDetailDTO }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const imageUrl = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? null;
  const maxStock = Math.max(product.stockQuantity, 0);

  const buildCartItem = () => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    code: product.code,
    price,
    salePrice,
    imageUrl,
    maxStock: maxStock || 99,
  });

  const handleAddToCart = () => {
    addItem(buildCartItem(), quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(buildCartItem(), quantity);
    router.push("/checkout");
  };

  const whatsappMessage = `Hello CVR Handicrafts, I would like to know more about "${product.name}" (Code: ${product.code || "N/A"}).`;

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-3">
        <span className="font-display text-3xl font-bold text-espresso-900">
          {formatINR(salePrice ?? price)}
        </span>
        {salePrice && (
          <span className="text-lg text-espresso-400 line-through">{formatINR(price)}</span>
        )}
      </div>

      <p className={`mb-6 text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
        {product.inStock ? "In Stock" : "Currently Out of Stock"}
      </p>

      {product.inStock && (
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-medium text-espresso-600">Quantity</span>
          <div className="flex items-center gap-3 rounded-full border border-espresso-200 px-3 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => (maxStock ? Math.min(maxStock, q + 1) : q + 1))}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="btn-outline-gold flex-1 disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleBuyNow}
          disabled={!product.inStock}
          className="btn-gold flex-1 disabled:opacity-40"
        >
          <Zap className="h-4 w-4" /> Buy Now
        </motion.button>
      </div>

      <a
        href={getWhatsappLink(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-espresso-500 hover:text-green-600"
      >
        <MessageCircle className="h-4 w-4" /> Ask about this product on WhatsApp
      </a>
    </div>
  );
}
