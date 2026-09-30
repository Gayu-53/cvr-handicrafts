import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c: (typeof categories)[number]) => ({
    url: `${siteConfig.siteUrl}/shop?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p: (typeof products)[number]) => ({
    url: `${siteConfig.siteUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
