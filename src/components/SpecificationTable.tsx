import type { ProductSpecDTO } from "@/types/catalogue";

export default function SpecificationTable({ specifications }: { specifications: ProductSpecDTO[] }) {
  if (!specifications || specifications.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-4 font-display text-xl font-bold text-espresso-900">Specifications</h2>
      <dl className="divide-y divide-espresso-100 rounded-xl border border-espresso-100 bg-white">
        {specifications.map((spec) => (
          <div key={spec.id} className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-sm font-medium text-espresso-500">{spec.label}</dt>
            <dd className="text-sm font-semibold text-espresso-900">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
