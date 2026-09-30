"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig, getWhatsappLink } from "@/lib/siteConfig";

export default function ContactSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-cvr">
        <div className="mb-12 text-center">
          <span className="section-eyebrow">Get in Touch</span>
          <h2 className="section-heading">We'd Love to Hear From You</h2>
          <div className="divider-ornament" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Phone,
              title: "Call Us",
              lines: [`Office: ${siteConfig.officePhone}`, `${siteConfig.contactPersonName}: ${siteConfig.contactPersonPhone}`],
              href: getWhatsappLink(),
            },
            {
              icon: Mail,
              title: "Email Us",
              lines: [siteConfig.email],
              href: `mailto:${siteConfig.email}`,
            },
            {
              icon: MapPin,
              title: "Visit Us",
              lines: [
                siteConfig.address.line1,
                siteConfig.address.line2,
                `${siteConfig.address.city} – ${siteConfig.address.pincode}`,
              ],
              href: undefined,
            },
          ].map((card, i) => (
            <motion.a
              key={card.title}
              href={card.href}
              target={card.href?.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-cvr flex flex-col items-center p-8 text-center"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-espresso-900">
                <card.icon className="h-5 w-5 text-gold-300" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-espresso-900">
                {card.title}
              </h3>
              {card.lines.map((line) => (
                <p key={line} className="text-sm text-espresso-500">{line}</p>
              ))}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
