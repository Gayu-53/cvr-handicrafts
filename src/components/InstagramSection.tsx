"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export default function InstagramSection() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="container-cvr">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-gold-200 bg-white px-8 py-12 text-center shadow-card"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient">
            <Instagram className="h-7 w-7 text-espresso-900" />
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso-900">
            Follow Our Journey
          </h2>
          <p className="mt-2 text-espresso-500">
            See our latest handcrafted pieces, behind-the-scenes moments, and
            new arrivals on Instagram.
          </p>
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold mt-6"
          >
            <Instagram className="h-4 w-4" /> {siteConfig.instagramHandle}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
