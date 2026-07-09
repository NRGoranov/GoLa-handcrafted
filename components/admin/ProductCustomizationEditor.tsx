"use client";

import {
  createCustomCheckboxOption,
  mergeCustomizationOptions
} from "@/lib/products/customization-options";
import type { ProductKind } from "@/types/product-record";
import type { ProductCustomizationOption } from "@/types/product-customization";

type ProductCustomizationEditorProps = {
  productKind: ProductKind;
  engravingAddOnEur: number | null;
  options: ProductCustomizationOption[] | null;
  onChange: (options: ProductCustomizationOption[]) => void;
};

export default function ProductCustomizationEditor({
  productKind,
  engravingAddOnEur,
  options,
  onChange
}: ProductCustomizationEditorProps) {
  const merged = mergeCustomizationOptions(options, productKind, engravingAddOnEur);

  const patchOption = (id: string, patch: Partial<ProductCustomizationOption>) => {
    onChange(merged.map((option) => (option.id === id ? { ...option, ...patch } : option)));
  };

  const patchOptionLabel = (id: string, locale: "en" | "bg", value: string) => {
    onChange(
      merged.map((option) =>
        option.id === id
          ? { ...option, label: { ...option.label, [locale]: value } }
          : option
      )
    );
  };

  const removeOption = (id: string) => {
    onChange(merged.filter((option) => option.id !== id));
  };

  const addCheckboxOption = () => {
    onChange([...merged, createCustomCheckboxOption()]);
  };

  return (
    <section className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ivory">Customer options</h2>
          <p className="mt-2 text-sm text-mist">
            Choose which options appear in the product configurator. Disable options this product does not need
            (for example chain color on earrings). Add checkbox add-ons such as custom engraving.
          </p>
        </div>
        <button
          type="button"
          onClick={addCheckboxOption}
          className="rounded-full border border-caramel/40 px-4 py-2 text-sm text-caramel hover:bg-caramel/10"
        >
          + Checkbox option
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {merged.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-ivory/10 bg-black/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-ivory">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#b78b5a]"
                  checked={option.enabled}
                  onChange={(event) => patchOption(option.id, { enabled: event.target.checked })}
                />
                <span className="font-medium">
                  {option.type === "swatch" ? "Color swatches" : "Checkbox"}
                  {option.preset ? (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-mist">Preset</span>
                  ) : null}
                </span>
              </label>
              {!option.preset ? (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="text-xs text-red-200 underline decoration-red-200/30 underline-offset-2 hover:text-red-100"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                className="admin-input"
                placeholder="Label (English)"
                value={option.label.en}
                onChange={(event) => patchOptionLabel(option.id, "en", event.target.value)}
              />
              <input
                className="admin-input"
                placeholder="Label (Bulgarian)"
                value={option.label.bg}
                onChange={(event) => patchOptionLabel(option.id, "bg", event.target.value)}
              />
            </div>

            {option.type === "checkbox" ? (
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-mist">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#b78b5a]"
                    checked={option.showTextField === true}
                    onChange={(event) => patchOption(option.id, { showTextField: event.target.checked })}
                  />
                  Text field when checked
                </label>
                <label className="flex items-center gap-2 text-sm text-mist">
                  Add-on EUR
                  <input
                    className="admin-input w-24"
                    type="number"
                    min={0}
                    value={option.addOnEur ?? ""}
                    onChange={(event) =>
                      patchOption(option.id, {
                        addOnEur: event.target.value === "" ? null : Number(event.target.value) || 0
                      })
                    }
                  />
                </label>
              </div>
            ) : (
              <p className="mt-3 text-xs text-mist">
                {option.choices?.length ?? 0} color choices · shown as swatches on the live site.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
