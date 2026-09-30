import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalogueQueries";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";
import SpecificationTable from "@/components/SpecificationTable";
import ProductShowcaseSection from "@/components/ProductShowcaseSection";
import type { ProductDetailDTO, ProductListItemDTO } from "@/types/catalogue";
import { toPlain } from "@/lib/serialize";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.metaTitle || product.name,
    description:
      product.metaDescription ||
      product.shortDescription ||
      `Buy ${product.name} — handcrafted by CVR Handicrafts.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);

  return (
    <div className="container-cvr py-8 sm:py-14">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-espresso-400">
        <Link href="/" className="hover:text-gold-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-gold-600">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-gold-600">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-espresso-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.categories && product.categories.length > 0 ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-600">
              {product.categories.map((link: any) => link.category.name).join(" · ")}
              {product.subcategoryLabel ? ` · ${product.subcategoryLabel}` : ""}
            </p>
          ) : product.category ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-600">
              {product.category.name}
              {product.subcategoryLabel ? ` · ${product.subcategoryLabel}` : ""}
            </p>
          ) : null}
          <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">
            {product.name}
          </h1>
          {product.code && (
            <p className="mt-1 text-sm text-espresso-400">Product Code: {product.code}</p>
          )}

          <div className="mt-6">
            <ProductActions product={toPlain(product) as unknown as ProductDetailDTO} />
          </div>

          {product.shortDescription && (
            <p className="mt-6 leading-relaxed text-espresso-600">{product.shortDescription}</p>
          )}

          <SpecificationTable specifications={product.specifications} />
        </div>
      </div>

      {product.description && (
        <div className="mt-14 max-w-3xl">
          <h2 className="mb-3 font-display text-xl font-bold text-espresso-900">
            About This Piece
          </h2>
          <p className="leading-relaxed text-espresso-600">{product.description}</p>
        </div>
      )}

      <div className="mt-16">
        <ProductShowcaseSection
          eyebrow="You Might Also Like"
          title="Related Pieces"
          products={toPlain(related) as unknown as ProductListItemDTO[]}
          viewAllHref={`/shop?category=${product.category?.slug ?? ""}`}
        />
      </div>
    </div>
  );
}
