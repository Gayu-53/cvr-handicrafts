import type { Metadata } from "next";
import Image from "next/image";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about CVR Handicrafts — a Coimbatore-based business preserving traditional Indian craftsmanship through handcrafted statues, Buddha idols, and Tanjore art.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="bg-espresso-gradient py-16 text-center text-cream sm:py-20">
        <div className="container-cvr">
          <Image
            src="/logo.png"
            alt="CVR Handicrafts"
            width={90}
            height={90}
            className="mx-auto mb-6 h-20 w-20 object-contain"
          />
          <h1 className="font-display text-4xl font-bold text-gold-300">About CVR Handicrafts</h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/70">
            A Coimbatore-based handicraft business dedicated to bringing
            authentic, handcrafted Indian art into homes everywhere.
          </p>
        </div>
      </section>
      <AboutSection />
      <ContactSection />
    </div>
  );
}
