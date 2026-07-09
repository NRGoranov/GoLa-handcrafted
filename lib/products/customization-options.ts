import { GIFT_BOX_PAPER_IMAGE_BY_INDEX } from "@/lib/giftBoxAssets";
import type { Locale } from "@/lib/i18n";
import type { ProductKind } from "@/types/product-record";
import type {
  ProductCustomizationChoice,
  ProductCustomizationOption,
  ProductOptionConfig,
  ResolvedProductOption
} from "@/types/product-customization";

const PAPER_SWATCHES = ["#faf8f5", "#f5ead8", "#c4a574", "#0b0b0b", "#e8c4c8", "#1e2a4a"] as const;
const LINING_SWATCHES = [
  "#d8c3a5",
  "#556b2f",
  "#6b1f2b",
  "#0f766e",
  "#d8a7b1",
  "#0b0b0b",
  "#36454f",
  "#ff7f50",
  "#8b5a2b"
] as const;
const WOOD_SWATCHES = ["#d6b88f", "#6b4a2f", "#5a2a27", "#111111"] as const;
const CHAIN_SWATCHES = ["#d4af37", "#c0c0c0", "#cd7f32", "#0b0b0b"] as const;

function choice(
  id: string,
  en: string,
  bg: string,
  swatch?: string,
  imageUrl?: string
): ProductCustomizationChoice {
  return { id, label: { en, bg }, swatch, imageUrl };
}

function swatchOption(
  id: string,
  labelEn: string,
  labelBg: string,
  choices: NonNullable<ProductCustomizationOption["choices"]>
): ProductCustomizationOption {
  return {
    id,
    type: "swatch",
    label: { en: labelEn, bg: labelBg },
    enabled: true,
    choices,
    preset: true
  };
}

function checkboxOption(
  id: string,
  labelEn: string,
  labelBg: string,
  addOnEur: number | null,
  showTextField = false
): ProductCustomizationOption {
  return {
    id,
    type: "checkbox",
    label: { en: labelEn, bg: labelBg },
    enabled: true,
    addOnEur,
    showTextField,
    preset: true
  };
}

export function getPresetCustomizationOptions(
  productKind: ProductKind,
  engravingAddOnEur: number | null = 20
): ProductCustomizationOption[] {
  const woodChoices = [
    choice("natural", "Natural", "Естествен", WOOD_SWATCHES[0]),
    choice("walnut", "Walnut", "Орех", WOOD_SWATCHES[1]),
    choice("mahogany", "Mahogany", "Махагон", WOOD_SWATCHES[2]),
    choice("ebony", "Ebony", "Абанос", WOOD_SWATCHES[3])
  ];

  if (productKind === "giftBox") {
    const paperChoices = [
      choice("ivory", "Ivory", "Айвори", PAPER_SWATCHES[0], GIFT_BOX_PAPER_IMAGE_BY_INDEX[0]),
      choice("cream", "Cream", "Крем", PAPER_SWATCHES[1], GIFT_BOX_PAPER_IMAGE_BY_INDEX[1]),
      choice("kraft", "Kraft", "Крафт", PAPER_SWATCHES[2], GIFT_BOX_PAPER_IMAGE_BY_INDEX[2]),
      choice("black", "Black", "Черен", PAPER_SWATCHES[3], GIFT_BOX_PAPER_IMAGE_BY_INDEX[3]),
      choice("blush", "Blush", "Розово", PAPER_SWATCHES[4], GIFT_BOX_PAPER_IMAGE_BY_INDEX[4]),
      choice("navy", "Navy", "Тъмносин", PAPER_SWATCHES[5], GIFT_BOX_PAPER_IMAGE_BY_INDEX[5])
    ];

    return [
      swatchOption("paperColor", "Paper color", "Цвят на хартията", paperChoices),
      swatchOption("woodCoatingColor", "Wood coating color", "Цвят на покритието", woodChoices),
      checkboxOption("customEngraving", "Custom engraving", "Персонално гравиране", engravingAddOnEur, true)
    ];
  }

  const liningChoices = [
    choice("light-beige", "Light Beige", "Светло бежово", LINING_SWATCHES[0]),
    choice("olive", "Olive Green", "Маслинено зелено", LINING_SWATCHES[1]),
    choice("burgundy", "Burgundy", "Бордо", LINING_SWATCHES[2]),
    choice("teal", "Teal", "Тийл", LINING_SWATCHES[3]),
    choice("blush", "Blush", "Розово", LINING_SWATCHES[4]),
    choice("black", "Black", "Черно", LINING_SWATCHES[5]),
    choice("charcoal", "Charcoal", "Антрацит", LINING_SWATCHES[6]),
    choice("coral", "Coral", "Корал", LINING_SWATCHES[7]),
    choice("cognac", "Cognac", "Коняк", LINING_SWATCHES[8])
  ];

  const chainChoices = [
    choice("gold", "Gold", "Златен", CHAIN_SWATCHES[0]),
    choice("silver", "Silver", "Сребърен", CHAIN_SWATCHES[1]),
    choice("bronze", "Bronze", "Бронзов", CHAIN_SWATCHES[2]),
    choice("black", "Black", "Черен", CHAIN_SWATCHES[3])
  ];

  return [
    swatchOption("liningColor", "Inside color", "Цвят отвътре", liningChoices),
    swatchOption("woodCoatingColor", "Wood coating color", "Цвят на покритието", woodChoices),
    swatchOption("chainColor", "Chain color", "Цвят на верижката", chainChoices),
    checkboxOption(
      "customEngraving",
      "Custom engraving",
      "Персонално гравиране",
      engravingAddOnEur ?? 20,
      true
    )
  ];
}

function pickLocalized(text: { en: string; bg: string }, locale: Locale): string {
  return text[locale]?.trim() || text.en || text.bg;
}

function mergePresetOption(
  preset: ProductCustomizationOption,
  stored: ProductCustomizationOption | undefined
): ProductCustomizationOption {
  if (!stored) return preset;
  return {
    ...preset,
    enabled: stored.enabled,
    label: stored.label?.en || stored.label?.bg ? stored.label : preset.label,
    addOnEur: stored.addOnEur ?? preset.addOnEur,
    showTextField: stored.showTextField ?? preset.showTextField,
    choices: stored.choices?.length ? stored.choices : preset.choices
  };
}

export function mergeCustomizationOptions(
  stored: ProductCustomizationOption[] | null | undefined,
  productKind: ProductKind,
  engravingAddOnEur: number | null = 20
): ProductCustomizationOption[] {
  const presets = getPresetCustomizationOptions(productKind, engravingAddOnEur);
  const storedList = stored ?? [];
  const storedById = new Map(storedList.map((option) => [option.id, option]));
  const presetIds = new Set(presets.map((option) => option.id));

  const mergedPresets = presets.map((preset) => mergePresetOption(preset, storedById.get(preset.id)));
  const custom = storedList.filter((option) => !presetIds.has(option.id));

  return [...mergedPresets, ...custom.map((option) => ({ ...option, preset: false }))];
}

export function resolveCustomizationOptions(
  options: ProductCustomizationOption[],
  locale: Locale
): ResolvedProductOption[] {
  return options
    .filter((option) => option.enabled)
    .map((option) => ({
      id: option.id,
      type: option.type,
      label: pickLocalized(option.label, locale),
      choices: option.choices?.map((choice) => ({
        label: pickLocalized(choice.label, locale),
        swatch: choice.swatch,
        imageUrl: choice.imageUrl
      })),
      addOnEur: option.addOnEur ?? undefined,
      showTextField: option.showTextField
    }));
}

export function defaultOptionConfig(options: ResolvedProductOption[]): ProductOptionConfig {
  const config: ProductOptionConfig = {};
  for (const option of options) {
    if (option.type === "swatch") config[option.id] = 0;
    if (option.type === "checkbox") {
      config[option.id] = false;
      if (option.showTextField) config[`${option.id}__text`] = "";
    }
  }
  return config;
}

const LEGACY_HAND_BAG_MAP: Record<string, keyof ProductOptionConfig> = {
  liningColor: "liningColor",
  woodCoatingColor: "woodCoatingColor",
  chainColor: "chainColor",
  customEngraving: "customEngraving",
  engravingText: "customEngraving__text"
};

const LEGACY_GIFT_BOX_MAP: Record<string, keyof ProductOptionConfig | string> = {
  paperColor: "paperColor",
  woodCoatingColor: "woodCoatingColor",
  customEngraving: "customEngraving",
  engravingText: "customEngraving__text"
};

export function migrateLegacyConfig(
  stored: Record<string, unknown> | null | undefined,
  options: ResolvedProductOption[]
): ProductOptionConfig {
  const config = defaultOptionConfig(options);
  if (!stored) return config;

  if (stored.options && typeof stored.options === "object") {
    Object.assign(config, stored.options as ProductOptionConfig);
  }

  const legacyMap = options.some((option) => option.id === "paperColor")
    ? LEGACY_GIFT_BOX_MAP
    : LEGACY_HAND_BAG_MAP;

  for (const [legacyKey, optionKey] of Object.entries(legacyMap)) {
    const value = stored[legacyKey];
    if (value === undefined || value === null) continue;
    config[String(optionKey)] = value as number | boolean | string;
  }

  for (const option of options) {
    if (option.type === "swatch") {
      const index = config[option.id];
      if (typeof index === "number" && option.choices?.length) {
        config[option.id] = Math.max(0, Math.min(index, option.choices.length - 1));
      }
    }
  }

  return config;
}

export function optionConfigTextKey(optionId: string): string {
  return `${optionId}__text`;
}

export function calculateOptionAddOnTotal(
  options: ResolvedProductOption[],
  config: ProductOptionConfig
): number {
  return options.reduce((total, option) => {
    if (option.type !== "checkbox" || !option.addOnEur) return total;
    return config[option.id] === true ? total + option.addOnEur : total;
  }, 0);
}

export function normalizeCustomizationOptions(
  options: ProductCustomizationOption[] | null | undefined
): ProductCustomizationOption[] | null {
  if (!options) return null;
  if (!Array.isArray(options)) return null;
  return options
    .filter((option) => option && typeof option.id === "string" && option.id.trim())
    .map((option) => ({
      id: option.id.trim(),
      type: option.type === "checkbox" ? "checkbox" : "swatch",
      label: {
        en: option.label?.en?.trim() ?? "",
        bg: option.label?.bg?.trim() ?? ""
      },
      enabled: option.enabled !== false,
      choices: option.choices?.map((choice, index) => ({
        id: choice.id?.trim() || `choice-${index}`,
        label: {
          en: choice.label?.en?.trim() ?? "",
          bg: choice.label?.bg?.trim() ?? ""
        },
        swatch: choice.swatch,
        imageUrl: choice.imageUrl
      })),
      addOnEur: option.addOnEur ?? null,
      showTextField: option.showTextField === true,
      preset: option.preset === true
    }));
}

export function createCustomCheckboxOption(): ProductCustomizationOption {
  const id = `option-${Date.now().toString(36)}`;
  return {
    id,
    type: "checkbox",
    label: { en: "Custom option", bg: "Допълнителна опция" },
    enabled: true,
    addOnEur: null,
    showTextField: true,
    preset: false
  };
}
