"use client";

import { useEffect, useState } from "react";
import DragSortList, { DragHandle } from "@/components/admin/DragSortList";
import {
  createCustomCheckboxOption,
  createCustomSizeChoice,
  createCustomSwatchChoice,
  mergeCustomizationOptions
} from "@/lib/products/customization-options";
import type { ProductKind } from "@/types/product-record";
import type {
  ProductCustomizationChoice,
  ProductCustomizationOption
} from "@/types/product-customization";

type ProductCustomizationEditorProps = {
  productId: string;
  syncKey: string;
  productKind: ProductKind;
  engravingAddOnEur: number | null;
  offerGiftBoxUpsell?: boolean;
  onOfferGiftBoxUpsellChange?: (enabled: boolean) => void;
  options: ProductCustomizationOption[] | null;
  onChange: (options: ProductCustomizationOption[]) => void;
};

function mergeOptions(
  options: ProductCustomizationOption[] | null,
  productKind: ProductKind,
  engravingAddOnEur: number | null
): ProductCustomizationOption[] {
  return mergeCustomizationOptions(options, productKind, engravingAddOnEur);
}

function normalizeHexForPicker(value?: string): string {
  const hex = (value ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return `#${hex}`.toLowerCase();
  return "#b78b5a";
}

function reorderByIds<T extends { id: string }>(items: T[], orderedIds: string[]): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered: T[] = [];
  for (const id of orderedIds) {
    const item = byId.get(id);
    if (item) ordered.push(item);
  }
  for (const item of items) {
    if (!orderedIds.includes(item.id)) ordered.push(item);
  }
  return ordered;
}

export default function ProductCustomizationEditor({
  productId,
  syncKey,
  productKind,
  engravingAddOnEur,
  offerGiftBoxUpsell = true,
  onOfferGiftBoxUpsellChange,
  options,
  onChange
}: ProductCustomizationEditorProps) {
  const [localOptions, setLocalOptions] = useState(() =>
    mergeOptions(options, productKind, engravingAddOnEur)
  );

  useEffect(() => {
    setLocalOptions(mergeOptions(options, productKind, engravingAddOnEur));
  }, [productId, syncKey]);

  const commit = (next: ProductCustomizationOption[]) => {
    setLocalOptions(next);
    onChange(next);
  };

  const patchOption = (id: string, patch: Partial<ProductCustomizationOption>) => {
    commit(localOptions.map((option) => (option.id === id ? { ...option, ...patch } : option)));
  };

  const patchOptionLabel = (id: string, locale: "en" | "bg", value: string) => {
    commit(
      localOptions.map((option) =>
        option.id === id ? { ...option, label: { ...option.label, [locale]: value } } : option
      )
    );
  };

  const patchChoice = (
    optionId: string,
    choiceId: string,
    patch: Partial<ProductCustomizationChoice>
  ) => {
    commit(
      localOptions.map((option) => {
        if (option.id !== optionId || option.type !== "swatch") return option;
        return {
          ...option,
          choices: (option.choices ?? []).map((choice) =>
            choice.id === choiceId ? { ...choice, ...patch } : choice
          )
        };
      })
    );
  };

  const patchChoiceLabel = (
    optionId: string,
    choiceId: string,
    locale: "en" | "bg",
    value: string
  ) => {
    commit(
      localOptions.map((option) => {
        if (option.id !== optionId || option.type !== "swatch") return option;
        return {
          ...option,
          choices: (option.choices ?? []).map((choice) =>
            choice.id === choiceId
              ? { ...choice, label: { ...choice.label, [locale]: value } }
              : choice
          )
        };
      })
    );
  };

  const removeOption = (id: string) => {
    commit(localOptions.filter((option) => option.id !== id));
  };

  const addCheckboxOption = () => {
    commit([...localOptions, createCustomCheckboxOption()]);
  };

  const addColorChoice = (optionId: string) => {
    commit(
      localOptions.map((option) =>
        option.id === optionId && option.type === "swatch"
          ? {
              ...option,
              choices: [
                ...(option.choices ?? []),
                option.id === "boxSize" ? createCustomSizeChoice() : createCustomSwatchChoice()
              ]
            }
          : option
      )
    );
  };

  const removeColorChoice = (optionId: string, choiceId: string) => {
    commit(
      localOptions.map((option) => {
        if (option.id !== optionId || option.type !== "swatch") return option;
        return {
          ...option,
          choices: (option.choices ?? []).filter((choice) => choice.id !== choiceId)
        };
      })
    );
  };

  const reorderOptions = (orderedIds: string[]) => {
    commit(reorderByIds(localOptions, orderedIds));
  };

  const reorderChoices = (optionId: string, orderedIds: string[]) => {
    commit(
      localOptions.map((option) => {
        if (option.id !== optionId || option.type !== "swatch") return option;
        return {
          ...option,
          choices: reorderByIds(option.choices ?? [], orderedIds)
        };
      })
    );
  };

  return (
    <section className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ivory">Customer options</h2>
          <p className="mt-2 text-sm text-mist">
            Configure options for this product only. Drag groups or sizes/colors to reorder how they
            appear on the details page. Use + Add color inside a preset group to add swatches there.
            Disable whole groups that do not apply.
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

      {productKind === "handbag" && onOfferGiftBoxUpsellChange ? (
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-ivory/10 bg-black/20 p-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[#b78b5a]"
            checked={offerGiftBoxUpsell}
            onChange={(event) => onOfferGiftBoxUpsellChange(event.target.checked)}
          />
          <span className="text-sm text-ivory/90">
            <span className="font-medium text-caramel">Premium gift box add-on</span>
            <span className="mt-1 block text-mist">
              When enabled, customers see an &quot;Add premium gift box&quot; checkbox on this product&apos;s
              details page. Turn off for items like earrings that should not offer gift packaging.
            </span>
          </span>
        </label>
      ) : null}

      <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-mist">
        Drag option groups to reorder
      </p>

      <div className="mt-2">
        <DragSortList
          items={localOptions}
          onReorder={reorderOptions}
          className="space-y-3"
          renderItem={(option, _index, { dragHandleProps, isDragging }) => (
            <div
              className={`rounded-xl border border-ivory/10 bg-black/20 p-4 ${
                isDragging ? "bg-[#151515]" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <DragHandle dragHandleProps={dragHandleProps} />
                  <label className="flex items-center gap-2 text-sm text-ivory">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#b78b5a]"
                      checked={option.enabled}
                      onChange={(event) => patchOption(option.id, { enabled: event.target.checked })}
                    />
                    <span className="font-medium">
                      {option.type === "swatch"
                        ? option.id === "boxSize"
                          ? "Box sizes"
                          : option.label.en || option.label.bg || "Colors"
                        : "Checkbox"}
                      {option.preset ? (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-mist">
                          Preset
                        </span>
                      ) : null}
                    </span>
                  </label>
                </div>
                {!option.preset ? (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="text-xs text-red-200 underline decoration-red-200/30 underline-offset-2 hover:text-red-100"
                  >
                    Remove option
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
                      onChange={(event) =>
                        patchOption(option.id, { showTextField: event.target.checked })
                      }
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
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-mist">
                      {option.id === "boxSize"
                        ? `Sizes (${option.choices?.length ?? 0}) · drag to reorder`
                        : `Colors in “${option.label.en || option.label.bg || option.id}” (${option.choices?.length ?? 0}) · drag to reorder`}
                    </p>
                    <button
                      type="button"
                      onClick={() => addColorChoice(option.id)}
                      className="rounded-full border border-caramel/40 px-3 py-1 text-xs text-caramel hover:bg-caramel/10"
                    >
                      {option.id === "boxSize" ? "+ Add size" : "+ Add color"}
                    </button>
                  </div>

                  {(option.choices ?? []).length === 0 ? (
                    <p className="rounded-xl border border-dashed border-ivory/15 px-3 py-4 text-sm text-mist">
                      {option.id === "boxSize"
                        ? "No sizes yet. Add at least one size or disable this option."
                        : "No colors yet. Add at least one color or disable this option."}
                    </p>
                  ) : (
                    <DragSortList
                      items={option.choices ?? []}
                      onReorder={(orderedIds) => reorderChoices(option.id, orderedIds)}
                      className="space-y-3"
                      renderItem={(choice, _choiceIndex, choiceMeta) => (
                        <div
                          className={`rounded-xl border border-ivory/10 bg-[#111] p-3 ${
                            choiceMeta.isDragging ? "bg-[#0b0b0b]" : ""
                          }`}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <DragHandle dragHandleProps={choiceMeta.dragHandleProps} />
                              {option.id !== "boxSize" ? (
                                <span
                                  className="h-6 w-6 rounded-full border border-ivory/20"
                                  style={{ backgroundColor: choice.swatch ?? "#888888" }}
                                  aria-hidden
                                />
                              ) : null}
                              <span className="text-xs text-mist">{choice.id}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeColorChoice(option.id, choice.id)}
                              className="text-xs text-red-200 underline decoration-red-200/30 underline-offset-2 hover:text-red-100"
                            >
                              {option.id === "boxSize" ? "Remove size" : "Remove color"}
                            </button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              className="admin-input"
                              placeholder={
                                option.id === "boxSize"
                                  ? "Size name (English)"
                                  : "Color name (English)"
                              }
                              value={choice.label.en}
                              onChange={(event) =>
                                patchChoiceLabel(option.id, choice.id, "en", event.target.value)
                              }
                            />
                            <input
                              className="admin-input"
                              placeholder={
                                option.id === "boxSize"
                                  ? "Size name (Bulgarian)"
                                  : "Color name (Bulgarian)"
                              }
                              value={choice.label.bg}
                              onChange={(event) =>
                                patchChoiceLabel(option.id, choice.id, "bg", event.target.value)
                              }
                            />
                            {option.id === "boxSize" ? (
                              <>
                                <label className="flex items-center gap-2 text-sm text-mist">
                                  Price (EUR)
                                  <input
                                    className="admin-input w-24"
                                    type="number"
                                    min={0}
                                    value={choice.priceEur ?? ""}
                                    onChange={(event) =>
                                      patchChoice(option.id, choice.id, {
                                        priceEur:
                                          event.target.value === ""
                                            ? null
                                            : Number(event.target.value) || 0
                                      })
                                    }
                                  />
                                </label>
                                <input
                                  className="admin-input"
                                  placeholder="Dimensions (e.g. 23 × 15 × 8 cm)"
                                  value={choice.dimensions ?? ""}
                                  onChange={(event) =>
                                    patchChoice(option.id, choice.id, {
                                      dimensions: event.target.value
                                    })
                                  }
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <label className="flex shrink-0 flex-col items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-mist">
                                    Palette
                                    <input
                                      type="color"
                                      className="h-10 w-12 cursor-pointer rounded border border-ivory/15 bg-transparent p-0.5"
                                      value={normalizeHexForPicker(choice.swatch)}
                                      onChange={(event) =>
                                        patchChoice(option.id, choice.id, {
                                          swatch: event.target.value
                                        })
                                      }
                                      aria-label={`Pick color for ${choice.label.en || choice.id}`}
                                    />
                                  </label>
                                  <input
                                    className="admin-input min-w-0 flex-1"
                                    placeholder="Swatch hex (#b78b5a)"
                                    value={choice.swatch ?? ""}
                                    onChange={(event) =>
                                      patchChoice(option.id, choice.id, {
                                        swatch: event.target.value
                                      })
                                    }
                                  />
                                </div>
                                <input
                                  className="admin-input md:col-span-2"
                                  placeholder="Image URL (optional, gift box paper)"
                                  value={choice.imageUrl ?? ""}
                                  onChange={(event) =>
                                    patchChoice(option.id, choice.id, {
                                      imageUrl: event.target.value.trim() || undefined
                                    })
                                  }
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        />
      </div>
    </section>
  );
}
