import type { InquiryCart } from "@/lib/inquiry-cart";
import {
  getPresetCustomizationOptions,
  mergeCustomizationOptions,
  optionConfigTextKey,
  resolveCustomizationOptions
} from "@/lib/products/customization-options";
import { type Product, isGiftBox, isHandbag } from "@/lib/products";
import type { Locale } from "@/lib/i18n";
import type { ProductOptionConfig, ResolvedProductOption } from "@/types/product-customization";

type ProductInquiryCopy = {
  prefill: {
    engravingYes: string;
    engravingNo: string;
  };
  giftBoxAddonHeading: string;
  handbagAddonHeading: string;
  standaloneGiftBoxHeading: string;
  requestItemHeading: string;
};

export type HandbagConfigurationState = ProductOptionConfig;
export type GiftBoxConfigurationState = ProductOptionConfig;

export type ProductConfigurationState = {
  handbag: HandbagConfigurationState;
  giftBox: GiftBoxConfigurationState;
  includeGiftBox: boolean;
  includeHandbag: boolean;
  selectedHandbagId: string;
};

export type InquiryBundle = {
  handbag: { name: string; config: HandbagConfigurationState } | null;
  giftBox: { name: string; config: GiftBoxConfigurationState } | null;
};

export const defaultHandbagConfiguration: HandbagConfigurationState = {};
export const defaultGiftBoxConfiguration: GiftBoxConfigurationState = {};

export const defaultProductConfigurationState: ProductConfigurationState = {
  handbag: defaultHandbagConfiguration,
  giftBox: defaultGiftBoxConfiguration,
  includeGiftBox: false,
  includeHandbag: false,
  selectedHandbagId: "model-1"
};

type LegacyFlatConfiguration = Partial<{
  liningColor: number;
  woodCoatingColor: number;
  chainColor: number;
  insidePockets: boolean;
  customEngraving: boolean;
  engravingText: string;
  paperColor: number;
  includeGiftBox: boolean;
  giftBoxPaperColor: number;
  giftBoxWoodCoatingColor: number;
  giftBoxCustomEngraving: boolean;
  giftBoxEngravingText: string;
  includeHandbag: boolean;
  selectedHandbagId: string;
  handbag: HandbagConfigurationState;
  giftBox: GiftBoxConfigurationState;
  options: ProductOptionConfig;
}>;

export function normalizeProductConfiguration(
  parsed: LegacyFlatConfiguration | null | undefined
): ProductConfigurationState {
  if (!parsed) return defaultProductConfigurationState;

  if (parsed.handbag && parsed.giftBox) {
    return {
      handbag: { ...parsed.handbag },
      giftBox: { ...parsed.giftBox },
      includeGiftBox: parsed.includeGiftBox ?? false,
      includeHandbag: parsed.includeHandbag ?? false,
      selectedHandbagId: parsed.selectedHandbagId ?? defaultProductConfigurationState.selectedHandbagId
    };
  }

  return {
    handbag: {
      liningColor: parsed.liningColor ?? 0,
      woodCoatingColor: parsed.woodCoatingColor ?? 0,
      chainColor: parsed.chainColor ?? 0,
      customEngraving: parsed.customEngraving ?? false,
      engravingText: parsed.engravingText ?? ""
    },
    giftBox: {
      paperColor: parsed.giftBoxPaperColor ?? parsed.paperColor ?? 0,
      woodCoatingColor: parsed.giftBoxWoodCoatingColor ?? parsed.woodCoatingColor ?? 0,
      customEngraving: parsed.giftBoxCustomEngraving ?? parsed.customEngraving ?? false,
      engravingText: parsed.giftBoxEngravingText ?? parsed.engravingText ?? ""
    },
    includeGiftBox: parsed.includeGiftBox ?? false,
    includeHandbag: parsed.includeHandbag ?? false,
    selectedHandbagId: parsed.selectedHandbagId ?? defaultProductConfigurationState.selectedHandbagId
  };
}

function formatCheckboxValue(
  option: ResolvedProductOption,
  config: ProductOptionConfig,
  copy: ProductInquiryCopy
): string {
  const checked = config[option.id] === true;
  if (!checked) {
    return option.id === "customEngraving" ? copy.prefill.engravingNo : "No";
  }

  const textKey = optionConfigTextKey(option.id);
  const text = String(config[textKey] ?? "").trim();
  if (text) return `"${text}"`;
  return option.id === "customEngraving" ? copy.prefill.engravingYes : "Yes";
}

export function buildDynamicConfigLines(
  productName: string,
  options: ResolvedProductOption[],
  config: ProductOptionConfig,
  copy: ProductInquiryCopy
): string[] {
  const lines = [productName];

  for (const option of options) {
    if (option.type === "swatch") {
      const index = config[option.id];
      const label =
        typeof index === "number" ? option.choices?.[index]?.label ?? "" : "";
      lines.push(`${option.label} - ${label}`);
      continue;
    }

    lines.push(`${option.label} - ${formatCheckboxValue(option, config, copy)}`);
  }

  return lines;
}

function resolveGiftBoxOptions(locale: Locale = "en"): ResolvedProductOption[] {
  return resolveCustomizationOptions(
    mergeCustomizationOptions(null, "giftBox"),
    locale
  );
}

function formatNumberedLines(lines: string[]): string {
  return lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
}

export function buildInquiryCartMessage(
  cart: InquiryCart,
  copy: ProductInquiryCopy,
  products: Product[] = [],
  locale: Locale = "en"
): string {
  const productById = new Map(products.map((product) => [product.id, product]));
  const defaultGiftBoxOptions = resolveGiftBoxOptions(locale);
  const sections: string[] = [];

  cart.handbags.forEach((entry, index) => {
    const product = productById.get(entry.handbagId);
    const options = product?.customizationOptions ?? [];

    const itemParts: string[] = [
      copy.requestItemHeading
        .replace("{index}", String(index + 1))
        .replace("{name}", entry.handbagName),
      `${copy.handbagAddonHeading}:\n${formatNumberedLines(
        buildDynamicConfigLines(entry.handbagName, options, entry.config, copy)
      )}`
    ];

    if (entry.giftBox) {
      itemParts.push(
        `${copy.giftBoxAddonHeading}:\n${formatNumberedLines(
          buildDynamicConfigLines(
            entry.giftBox.name,
            defaultGiftBoxOptions,
            entry.giftBox.config,
            copy
          )
        )}`
      );
    }

    sections.push(itemParts.join("\n\n"));
  });

  if (cart.standaloneGiftBox) {
    sections.push(
      `${copy.standaloneGiftBoxHeading}:\n${formatNumberedLines(
        buildDynamicConfigLines(
          cart.standaloneGiftBox.name,
          defaultGiftBoxOptions,
          cart.standaloneGiftBox.config,
          copy
        )
      )}`
    );
  }

  return sections.join("\n\n---\n\n");
}

export function buildInquiryBundleMessage(
  bundle: InquiryBundle,
  copy: ProductInquiryCopy,
  options: {
    handbagOptions?: ResolvedProductOption[];
    giftBoxOptions?: ResolvedProductOption[];
    locale?: Locale;
  } = {}
): string {
  const locale = options.locale ?? "en";
  const handbagOptions = options.handbagOptions ?? [];
  const giftBoxOptions = options.giftBoxOptions ?? resolveGiftBoxOptions(locale);
  const sections: string[] = [];

  if (bundle.handbag) {
    const handbagSection = formatNumberedLines(
      buildDynamicConfigLines(
        bundle.handbag.name,
        handbagOptions,
        bundle.handbag.config,
        copy
      )
    );
    sections.push(
      bundle.giftBox ? `${copy.handbagAddonHeading}:\n${handbagSection}` : handbagSection
    );
  }

  if (bundle.giftBox) {
    const giftBoxSection = formatNumberedLines(
      buildDynamicConfigLines(bundle.giftBox.name, giftBoxOptions, bundle.giftBox.config, copy)
    );
    sections.push(
      bundle.handbag ? `${copy.giftBoxAddonHeading}:\n${giftBoxSection}` : giftBoxSection
    );
  }

  return sections.join("\n\n");
}

export function buildInquiryBundleFromModal(
  product: Product,
  state: ProductConfigurationState,
  copy: ProductInquiryCopy,
  options: {
    giftBoxProduct?: Product | null;
    handbagItems?: Product[];
    locale?: Locale;
  }
): InquiryBundle {
  const handbagItems = options.handbagItems ?? [];
  const selectedHandbag =
    handbagItems.find((item) => item.id === state.selectedHandbagId) ?? handbagItems[0] ?? null;

  if (isHandbag(product)) {
    return {
      handbag: { name: product.name, config: state.handbag },
      giftBox:
        state.includeGiftBox && options.giftBoxProduct
          ? { name: options.giftBoxProduct.name, config: state.giftBox }
          : null
    };
  }

  if (isGiftBox(product)) {
    return {
      handbag:
        state.includeHandbag && selectedHandbag
          ? { name: selectedHandbag.name, config: state.handbag }
          : null,
      giftBox: { name: product.name, config: state.giftBox }
    };
  }

  return { handbag: null, giftBox: null };
}

export function getDefaultGiftBoxOptions(locale: Locale = "en"): ResolvedProductOption[] {
  return resolveGiftBoxOptions(locale);
}

export function getDefaultHandbagOptions(locale: Locale = "en"): ResolvedProductOption[] {
  return resolveCustomizationOptions(getPresetCustomizationOptions("handbag"), locale);
}
