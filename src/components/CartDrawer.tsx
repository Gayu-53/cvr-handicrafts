"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { formatINR } from "@/lib/format";
import EmptyState from "./EmptyState";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, increment, decrement, removeItem, subtotal } =
    useCartStore();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-espresso-100 px-5 py-4">
              <h2 className="font-display text-lg font-bold text-espresso-900">
                Your Cart {items.length > 0 && `(${items.length})`}
              </h2>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-espresso-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is currently empty"
                  description="Browse our collections to find something you'll treasure."
                />
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-3 border-b border-espresso-100 pb-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-espresso-50">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="line-clamp-1 text-sm font-semibold text-espresso-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-espresso-500">
                              {formatINR(item.salePrice ?? item.price)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-espresso-200 px-2 py-1">
                              <button onClick={() => decrement(item.productId)} aria-label="Decrease quantity">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-4 text-center text-sm">{item.quantity}</span>
                              <button onClick={() => increment(item.productId)} aria-label="Increase quantity">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              aria-label="Remove item"
                              className="text-espresso-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-espresso-100 px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-medium text-espresso-600">Subtotal</span>
                  <span className="font-display text-lg font-bold text-espresso-900">
                    {formatINR(subtotal())}
                  </span>
                </div>
                <Link href="/checkout" onClick={closeDrawer} className="btn-gold w-full">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
