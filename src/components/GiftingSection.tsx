"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Home, Briefcase, Heart, Sparkles, Users } from "lucide-react";

// Static list for now — intentionally NOT hardcoded as "the final list."
// This is presentational content only; the actual products a customer sees
// still come entirely from the database via the normal Shop page and category
// filters. Nothing here restricts or predetermines what categories can exist.
const OCCASIONS = [
  { label: "Housewarming Gifts", icon: Home },
  { label: "Corporate Gifts", icon: Briefcase },
  { label: "Wedding Gifts", icon: Heart },
  { label: "Festival Gifts", icon: Sparkles },
  { label: "Return Gifts", icon: Users },
  { label: "Personalized Gifts", icon: Gift },
];

export default function GiftingSection() {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="container-cvr">
        <div className="mb-10 text-center">
          <span className="section-eyebrow">For Every Occasion</span>
          <h2 className="section-heading">Gifts Made for Every Occasion</h2>
          <div className="divider-ornament" />
          <p className="mx-auto max-w-xl text-espresso-500">
            From housewarming and weddings to corporate events, festivals and
            return gifts — discover thoughtful, personalized gifts made
            especially for your occasion.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {OCCASIONS.map((occasion, i) => (
            <motion.div
              key={occasion.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href="/shop"
                className="flex flex-col items-center gap-2 rounded-2xl border border-espresso-100 bg-white p-5 text-center shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-100">
                  <occasion.icon className="h-5 w-5 text-gold-600" />
                </div>
                <span className="text-xs font-medium text-espresso-700">{occasion.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
