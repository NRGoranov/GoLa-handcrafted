import type { LocalizedText } from "@/types/product-record";

export type ProductCustomizationChoice = {
  id: string;
  label: LocalizedText;
  swatch?: string;
  imageUrl?: string;
  /** Per-choice price (e.g. gift box S/M/L sizes). */
  priceEur?: number | null;
  /** Optional dimensions label shown when this choice is selected. */
  dimensions?: string;
};

export type ProductCustomizationOption = {
  id: string;
  type: "swatch" | "checkbox";
  label: LocalizedText;
  enabled: boolean;
  choices?: ProductCustomizationChoice[];
  addOnEur?: number | null;
  showTextField?: boolean;
  /** Preset options cannot be deleted — only disabled. */
  preset?: boolean;
};

export type ResolvedProductOption = {
  id: string;
  type: "swatch" | "checkbox";
  label: string;
  choices?: {
    label: string;
    swatch?: string;
    imageUrl?: string;
    priceEur?: number;
    dimensions?: string;
  }[];
  addOnEur?: number;
  showTextField?: boolean;
};

/** Customer selection state keyed by option id (swatch index, checkbox boolean, `${id}__text` string). */
export type ProductOptionConfig = Record<string, number | boolean | string>;
