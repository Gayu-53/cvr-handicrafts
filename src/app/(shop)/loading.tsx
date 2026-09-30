import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="container-cvr py-14">
      <ProductGridSkeleton count={8} />
    </div>
  );
}
