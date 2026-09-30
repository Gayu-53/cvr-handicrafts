"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=statues", label: "Statues" },
  { href: "/shop?category=buddha", label: "Buddha" },
  { href: "/shop?category=tanjore", label: "Tanjore" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  const totalItems = useCartStore((s) => s.totalItems());
  const openDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    setHasHydrated(true);

    const onScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-espresso-900/95 shadow-lg backdrop-blur-sm"
            : "bg-espresso-900"
        }`}
      >
        <div className="container-cvr flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="CVR Handicrafts"
              width={48}
              height={48}
              className="h-11 w-11 object-contain sm:h-12 sm:w-12"
              priority
            />

            <div className="hidden flex-col sm:flex">
              <span className="font-display text-lg font-bold leading-tight text-gold-300">
                CVR Handicrafts
              </span>

              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-100/70">
                Crafted with Tradition
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-cream/90 transition-colors hover:text-gold-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              aria-label="Search products"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-cream/90 transition-colors hover:bg-white/10 sm:flex"
            >
              <Search className="h-5 w-5" />
            </Link>

            <button
              onClick={openDrawer}
              aria-label="Open cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-cream/90 transition-colors hover:bg-white/10"
            >
              <ShoppingBag className="h-5 w-5" />

              <AnimatePresence>
                {hasHydrated && totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-espresso-900"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-cream/90 hover:bg-white/10 lg:hidden"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-gold-400/20 bg-espresso-900 lg:hidden"
            >
              <div className="container-cvr flex flex-col py-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="border-b border-white/5 py-3 text-cream/90 last:border-none"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer />
    </>
  );
}