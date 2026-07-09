import type { LocalizedText } from "@/types/product-record";

export type ProductCustomizationChoice = {
  id: string;
  label: LocalizedText;
  swatch?: string;
  imageUrl?: string;
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
  choices?: { label: string; swatch?: string; imageUrl?: string }[];
  addOnEur?: number;
  showTextField?: boolean;
};

/** Customer selection state keyed by option id (swatch index, checkbox boolean, `${id}__text` string). */
export type ProductOptionConfig = Record<string, number | boolean | string>;
