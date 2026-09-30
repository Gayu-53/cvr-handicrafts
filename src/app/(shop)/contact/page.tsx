import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";
import InstagramSection from "@/components/InstagramSection";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with CVR Handicrafts — call, email, WhatsApp, or visit our Coimbatore workshop.",
};

export default function ContactPage() {
  return (
    <div>
      <section className="bg-espresso-gradient py-16 text-center text-cream sm:py-20">
        <div className="container-cvr">
          <h1 className="font-display text-4xl font-bold text-gold-300">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/70">
            Have a question about a piece, bulk orders, or custom work? We'd love to help.
          </p>
        </div>
      </section>
      <ContactSection />
      <InstagramSection />
    </div>
  );
}
