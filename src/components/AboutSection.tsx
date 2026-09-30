"use client";

import { motion } from "framer-motion";
import { Sparkles, Hammer, Heart } from "lucide-react";

const POINTS = [
  {
    icon: Hammer,
    title: "Authentic Craftsmanship",
    desc: "Every piece is handcrafted using techniques passed down through generations of artisans.",
  },
  {
    icon: Sparkles,
    title: "Genuine Materials",
    desc: "From brass and German silver to clay and resin — we use materials true to tradition.",
  },
  {
    icon: Heart,
    title: "Made with Devotion",
    desc: "Our statues and idols are crafted with the same care and reverence they're meant to inspire.",
  },
];

export default function AboutSection() {
  return (
    <section className="bg-espresso-900 py-16 text-cream sm:py-24">
      <div className="container-cvr">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow text-gold-300">Our Story</span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Preserving Tradition, One Piece at a Time
          </h2>
          <div className="divider-ornament" />
          <p className="text-cream/70">
            CVR Handicrafts brings you handpicked statues, Buddha idols, and
            Tanjore art, sourced from skilled artisans who honour India's rich
            artistic heritage. Every piece tells a story of patience, skill,
            and devotion.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient">
                <point.icon className="h-6 w-6 text-espresso-900" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-gold-200">
                {point.title}
              </h3>
              <p className="text-sm leading-relaxed text-cream/60">{point.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
