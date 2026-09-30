import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  accent = "gold",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: "gold" | "green" | "red" | "blue";
}) {
  const accentClasses: Record<string, string> = {
    gold: "bg-gold-gradient text-espresso-900",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-espresso-400">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-espresso-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
