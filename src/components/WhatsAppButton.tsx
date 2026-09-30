"use client";

import { getWhatsappLink } from "@/lib/siteConfig";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsAppButton({ message }: { message?: string }) {
  return (
    <motion.a
      href={getWhatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with CVR Handicrafts on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full
        bg-[#25D366] text-white shadow-lg sm:bottom-6 sm:right-6"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <MessageCircle className="relative z-10 h-7 w-7" fill="white" strokeWidth={0} />
    </motion.a>
  );
}
