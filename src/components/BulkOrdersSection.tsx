"use client";

import { motion } from "framer-motion";
import { PackageCheck } from "lucide-react";
import { getWhatsappLink } from "@/lib/siteConfig";

export default function BulkOrdersSection() {
  return (
    <section className="bg-espresso-gradient py-16 text-cream sm:py-20">
      <div className="container-cvr">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-gold-300/20 bg-espresso-800/40 px-8 py-12 text-center backdrop-blur-sm"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient">
            <PackageCheck className="h-7 w-7 text-espresso-900" />
          </div>
          <span className="section-eyebrow text-gold-300">Bulk Orders Welcome</span>
          <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Planning an Event or Celebration?
          </h2>
          <p className="mt-3 max-w-lg text-cream/70">
            Planning an event, corporate gifting, wedding, celebration, or
            special occasion? We accept bulk orders and can customize products
            to suit your requirements.
          </p>
          <a
            href={getWhatsappLink(
              "Hello CVR Handicrafts, I'm interested in placing a bulk order. Could you share more details?"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold mt-6"
          >
            Enquire About Bulk Orders
          </a>
        </motion.div>
      </div>
    </section>
  );
}
