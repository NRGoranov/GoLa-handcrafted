"use client";

import type { ProductOptionConfig, ResolvedProductOption } from "@/types/product-customization";
import { optionConfigTextKey } from "@/lib/products/customization-options";

type ProductOptionsPanelProps = {
  groupId: string;
  options: ResolvedProductOption[];
  config: ProductOptionConfig;
  engravingAddsLabel: string;
  engravingNoSurchargeLabel: string;
  engravingTextPlaceholder: string;
  onUpdate: (next: ProductOptionConfig) => void;
  className?: string;
};

export default function ProductOptionsPanel({
  groupId,
  options,
  config,
  engravingAddsLabel,
  engravingNoSurchargeLabel,
  engravingTextPlaceholder,
  onUpdate,
  className = ""
}: ProductOptionsPanelProps) {
  if (!options.length) {
    return <p className="text-sm text-mist">No customization options for this product.</p>;
  }

  const patch = (patchConfig: ProductOptionConfig) => {
    onUpdate({ ...config, ...patchConfig });
  };

  return (
    <div className={className}>
      {options.map((option) => {
        if (option.type === "swatch" && option.choices?.length) {
          const swatches = option.choices.map((choice) => choice.swatch ?? "#888888");
          const labels = option.choices.map((choice) => {
            if (choice.priceEur != null && choice.priceEur >= 0) {
              return `${choice.label} — EUR ${choice.priceEur}`;
            }
            return choice.label;
          });
          const activeIndex = typeof config[option.id] === "number" ? (config[option.id] as number) : 0;

          return (
            <SwatchOptionFieldset
              key={option.id}
              legend={option.label}
              labels={labels}
              swatches={swatches}
              showSwatches={option.id !== "boxSize"}
              activeIndex={activeIndex}
              groupId={`${groupId}-${option.id}`}
              onSelect={(index) => patch({ [option.id]: index })}
              className={option.id === options[0]?.id ? "" : "mt-4"}
            />
          );
        }

        if (option.type === "checkbox") {
          const checked = config[option.id] === true;
          const textKey = optionConfigTextKey(option.id);
          const surchargeLabel =
            option.addOnEur && option.addOnEur > 0
              ? engravingAddsLabel.replace("{amount}", String(option.addOnEur))
              : engravingNoSurchargeLabel;

          return (
            <div key={option.id} className={option.id === options[0]?.id ? "" : "mt-4"}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#b78b5a]"
                  checked={checked}
                  onChange={(event) => patch({ [option.id]: event.target.checked })}
                />
                <span className="text-sm text-ivory/90">
                  <span className="font-medium text-caramel">{option.label}</span>{" "}
                  <span className="text-mist">({surchargeLabel})</span>
                </span>
              </label>

              {checked && option.showTextField ? (
                <input
                  type="text"
                  value={String(config[textKey] ?? "")}
                  onChange={(event) => patch({ [textKey]: event.target.value })}
                  placeholder={engravingTextPlaceholder}
                  className="focus-ring mt-3 w-full rounded-xl border border-ivory/20 bg-transparent px-4 py-2.5 text-sm text-ivory"
                />
              ) : null}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function SwatchOptionFieldset({
  legend,
  labels,
  swatches,
  showSwatches = true,
  activeIndex,
  groupId,
  onSelect,
  className = ""
}: {
  legend: string;
  labels: string[];
  swatches: string[];
  showSwatches?: boolean;
  activeIndex: number;
  groupId: string;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="mb-2 text-sm font-medium text-caramel">{legend}</legend>
      <div className="grid gap-2">
        {labels.map((label, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={`${groupId}-${index}`}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(index)}
              className={`focus-ring flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                isActive
                  ? "border-caramel/60 bg-caramel/10 text-ivory"
                  : "border-ivory/15 text-ivory/90 hover:border-ivory/30"
              }`}
            >
              <span>{label}</span>
              <span className="flex items-center gap-2">
                {showSwatches ? (
                  <span
                    className="h-5 w-5 rounded-full border border-ivory/20"
                    style={{ backgroundColor: swatches[index] }}
                    aria-hidden
                  />
                ) : null}
                <span className="w-4 text-center text-caramel">{isActive ? "✓" : ""}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
