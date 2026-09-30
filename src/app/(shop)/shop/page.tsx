import type { Metadata } from "next";
import ShopPageClient from "@/components/ShopPageClient";

export const metadata: Metadata = {
  title: "Shop All Handicrafts",
  description:
    "Browse our full collection of handcrafted statues, Buddha idols, and Tanjore art from CVR Handicrafts.",
};

export default function ShopPage() {
  return <ShopPageClient />;
}
