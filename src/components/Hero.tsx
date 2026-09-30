"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-espresso-gradient py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border-[3px] border-gold-300" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full border-[3px] border-gold-300" />
      </div>

      <div className="container-cvr relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="section-eyebrow text-gold-300"
          >
            Traditional Indian Handicrafts
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl font-bold leading-tight text-cream sm:text-5xl lg:text-6xl"
          >
            Crafted with{" "}
            <span className="bg-gold-gradient bg-clip-text text-transparent">Tradition</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-lg text-base leading-relaxed text-cream/70 sm:text-lg"
          >
            Discover handcrafted statues, Buddha idols, and Tanjore art —
            each piece shaped by artisans preserving techniques passed down
            through generations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link href="/shop" className="btn-gold">
              Explore Collection
            </Link>
            <Link href="/about" className="btn-outline-gold border-gold-300 text-gold-300 hover:text-espresso-900">
              Our Story
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto h-72 w-72 sm:h-96 sm:w-96"
        >
          <div className="absolute inset-0 rounded-full bg-gold-gradient opacity-20 blur-3xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full border border-gold-300/30 bg-espresso-800/40 backdrop-blur-sm">
            <Image
              src="/logo.png"
              alt="CVR Handicrafts"
              width={220}
              height={220}
              className="h-40 w-40 object-contain sm:h-52 sm:w-52"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
