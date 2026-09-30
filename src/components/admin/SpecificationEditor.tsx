"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";

export type SpecRow = { label: string; value: string; sortOrder: number };

export default function SpecificationEditor({
  specifications,
  onChange,
}: {
  specifications: SpecRow[];
  onChange: (specs: SpecRow[]) => void;
}) {
  const addSpec = () => {
    onChange([...specifications, { label: "", value: "", sortOrder: specifications.length }]);
  };

  const updateSpec = (index: number, field: "label" | "value", value: string) => {
    const updated = specifications.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange(updated);
  };

  const removeSpec = (index: number) => {
    onChange(specifications.filter((_, i) => i !== index).map((s, i) => ({ ...s, sortOrder: i })));
  };

  const moveSpec = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= specifications.length) return;
    const updated = [...specifications];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated.map((s, i) => ({ ...s, sortOrder: i })));
  };

  return (
    <div>
      {specifications.length === 0 ? (
        <p className="mb-3 text-sm text-espresso-400">
          No specifications added yet. Add fields like Material, Height, Weight, Diameter — whatever applies to this product.
        </p>
      ) : (
        <div className="mb-3 space-y-2">
          {specifications.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveSpec(i, -1)}
                className="cursor-grab text-espresso-300 hover:text-espresso-500"
                title="Reorder"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <input
                value={spec.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
                placeholder="Specification name (e.g. Material)"
                className="w-2/5 rounded-lg border border-espresso-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
              />
              <input
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                placeholder="Value (e.g. Brass)"
                className="flex-1 rounded-lg border border-espresso-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeSpec(i)}
                className="rounded-lg p-2 text-red-400 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addSpec}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-gold-300 px-4 py-2 text-sm font-medium text-gold-600 hover:bg-gold-50"
      >
        <Plus className="h-4 w-4" /> Add Specification
      </button>
    </div>
  );
}
