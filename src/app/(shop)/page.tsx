import type { Metadata } from "next";
import Hero from "@/components/Hero";
import CategoryShowcase from "@/components/CategoryShowcase";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import AboutSection from "@/components/AboutSection";
import InstagramSection from "@/components/InstagramSection";
import ContactSection from "@/components/ContactSection";
import BulkOrdersSection from "@/components/BulkOrdersSection";
import GiftingSection from "@/components/GiftingSection";
import {
  getActiveCategoriesWithProducts,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/catalogueQueries";
import type { ProductListItemDTO } from "@/types/catalogue";
import { toPlain } from "@/lib/serialize";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Shop handcrafted statues, Buddha idols, and Tanjore art from CVR Handicrafts — authentic Indian craftsmanship, made with tradition.",
};

export const revalidate = 60; // ISR: picks up admin changes within a minute without a full redeploy

export default async function HomePage() {
  const [categories, featured, newArrivals] = await Promise.all([
    getActiveCategoriesWithProducts(),
    getFeaturedProducts(8),
    getNewArrivals(8),
  ]);

  const categoryCards = categories.map((c: (typeof categories)[number]) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    productCount: c._count.productLinks,
  }));

  return (
    <>
      <Hero />
      <CategoryShowcase categories={categoryCards} />
      <ProductShowcaseSection
        eyebrow="Handpicked for You"
        title="Featured Pieces"
        products={toPlain(featured) as unknown as ProductListItemDTO[]}
        viewAllHref="/shop?featured=true"
      />
      <ProductShowcaseSection
        eyebrow="Just In"
        title="New Arrivals"
        products={toPlain(newArrivals) as unknown as ProductListItemDTO[]}
        viewAllHref="/shop?newArrivals=true"
      />
      <GiftingSection />
      <BulkOrdersSection />
      <AboutSection />
      <InstagramSection />
      <ContactSection />
    </>
  );
}
