import { PackageOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-espresso-200 bg-espresso-50/50 px-6 py-16 text-center">
      <Icon className="mb-4 h-12 w-12 text-espresso-300" />
      <p className="font-display text-lg font-semibold text-espresso-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-espresso-400">{description}</p>}
    </div>
  );
}
