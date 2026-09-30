import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/siteConfig";
import { Toaster } from "react-hot-toast";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),

  title: {
    default: `${siteConfig.businessName} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.businessName}`,
  },

  description:
    "Handcrafted statues, Buddha idols, Tanjore art dolls and traditional Indian handicrafts, made with authentic craftsmanship by CVR Handicrafts, Coimbatore.",

  keywords: [
    "handicrafts",
    "Tanjore dolls",
    "Buddha statue",
    "brass idols",
    "handmade statues",
    "Coimbatore handicrafts",
  ],

  openGraph: {
    title: `${siteConfig.businessName} — ${siteConfig.tagline}`,
    description:
      "Handcrafted statues, Buddha idols, Tanjore art dolls and traditional Indian handicrafts.",
    url: siteConfig.siteUrl,
    siteName: siteConfig.businessName,
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.businessName} — ${siteConfig.tagline}`,
  },

  icons: {
    icon: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        <WhatsAppButton />

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#2f2015",
              color: "#f7f1e6",
              border: "1px solid #dead38",
            },
          }}
        />
      </body>
    </html>
  );
}