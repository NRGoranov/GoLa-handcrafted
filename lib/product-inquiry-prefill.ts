import type { InquiryCart } from "@/lib/inquiry-cart";
import { type Product, isGiftBox, isHandbag } from "@/lib/products";

type ProductInquiryCopy = {
  labels: {
    liningColor: string;
    woodCoatingColor: string;
    chainColor: string;
    insidePockets: string;
    engraving: string;
    paperColor: string;
  };
  prefill: {
    pocketsYes: string;
    pocketsNo: string;
    engravingYes: string;
    engravingNo: string;
  };
  giftBoxAddonHeading: string;
  handbagAddonHeading: string;
  standaloneGiftBoxHeading: string;
  requestItemHeading: string;
  options: {
    colors: string[];
    woodCoatingColors: string[];
    chainColors: string[];
    paperColors: string[];
  };
};

export type HandbagConfigurationState = {
  liningColor: number;
  woodCoatingColor: number;
  chainColor: number;
  insidePockets: boolean;
  customEngraving: boolean;
  engravingText: string;
};

export type GiftBoxConfigurationState = {
  paperColor: number;
  woodCoatingColor: number;
  customEngraving: boolean;
  engravingText: string;
};

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

export const defaultHandbagConfiguration: HandbagConfigurationState = {
  liningColor: 0,
  woodCoatingColor: 0,
  chainColor: 0,
  insidePockets: false,
  customEngraving: false,
  engravingText: ""
};

export const defaultGiftBoxConfiguration: GiftBoxConfigurationState = {
  paperColor: 0,
  woodCoatingColor: 0,
  customEngraving: false,
  engravingText: ""
};

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
}>;

export function normalizeProductConfiguration(
  parsed: LegacyFlatConfiguration | null | undefined
): ProductConfigurationState {
  if (!parsed) return defaultProductConfigurationState;

  if (parsed.handbag && parsed.giftBox) {
    return {
      handbag: { ...defaultHandbagConfiguration, ...parsed.handbag, insidePockets: false },
      giftBox: { ...defaultGiftBoxConfiguration, ...parsed.giftBox },
      includeGiftBox: parsed.includeGiftBox ?? false,
      includeHandbag: parsed.includeHandbag ?? false,
      selectedHandbagId: parsed.selectedHandbagId ?? defaultProductConfigurationState.selectedHandbagId
    };
  }

  return {
    handbag: {
      liningColor: parsed.liningColor ?? defaultHandbagConfiguration.liningColor,
      woodCoatingColor: parsed.woodCoatingColor ?? defaultHandbagConfiguration.woodCoatingColor,
      chainColor: parsed.chainColor ?? defaultHandbagConfiguration.chainColor,
      insidePockets: false,
      customEngraving: parsed.customEngraving ?? defaultHandbagConfiguration.customEngraving,
      engravingText: parsed.engravingText ?? defaultHandbagConfiguration.engravingText
    },
    giftBox: {
      paperColor: parsed.giftBoxPaperColor ?? parsed.paperColor ?? defaultGiftBoxConfiguration.paperColor,
      woodCoatingColor:
        parsed.giftBoxWoodCoatingColor ??
        parsed.woodCoatingColor ??
        defaultGiftBoxConfiguration.woodCoatingColor,
      customEngraving:
        parsed.giftBoxCustomEngraving ?? parsed.customEngraving ?? defaultGiftBoxConfiguration.customEngraving,
      engravingText: parsed.giftBoxEngravingText ?? parsed.engravingText ?? defaultGiftBoxConfiguration.engravingText
    },
    includeGiftBox: parsed.includeGiftBox ?? false,
    includeHandbag: parsed.includeHandbag ?? false,
    selectedHandbagId: parsed.selectedHandbagId ?? defaultProductConfigurationState.selectedHandbagId
  };
}

function formatEngravingValue(
  customEngraving: boolean,
  engravingText: string,
  copy: ProductInquiryCopy
): string {
  if (!customEngraving) return copy.prefill.engravingNo;
  const text = engravingText.trim();
  return text ? `"${text}"` : copy.prefill.engravingYes;
}

function formatNumberedLines(lines: string[]): string {
  return lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
}

function buildHandbagConfigLines(
  handbagName: string,
  config: HandbagConfigurationState,
  copy: ProductInquiryCopy
): string[] {
  return [
    handbagName,
    `${copy.labels.liningColor} - ${copy.options.colors[config.liningColor] ?? ""}`,
    `${copy.labels.woodCoatingColor} - ${copy.options.woodCoatingColors[config.woodCoatingColor] ?? ""}`,
    `${copy.labels.chainColor} - ${copy.options.chainColors[config.chainColor] ?? ""}`,
    `${copy.labels.engraving} - ${formatEngravingValue(config.customEngraving, config.engravingText, copy)}`
  ];
}

function buildGiftBoxConfigLines(
  giftBoxName: string,
  config: GiftBoxConfigurationState,
  copy: ProductInquiryCopy
): string[] {
  return [
    giftBoxName,
    `${copy.labels.paperColor} - ${copy.options.paperColors[config.paperColor] ?? ""}`,
    `${copy.labels.woodCoatingColor} - ${copy.options.woodCoatingColors[config.woodCoatingColor] ?? ""}`,
    `${copy.labels.engraving} - ${formatEngravingValue(config.customEngraving, config.engravingText, copy)}`
  ];
}

export function buildInquiryCartMessage(cart: InquiryCart, copy: ProductInquiryCopy): string {
  const sections: string[] = [];

  cart.handbags.forEach((entry, index) => {
    const itemParts: string[] = [
      copy.requestItemHeading
        .replace("{index}", String(index + 1))
        .replace("{name}", entry.handbagName),
      `${copy.handbagAddonHeading}:\n${formatNumberedLines(
        buildHandbagConfigLines(entry.handbagName, entry.config, copy)
      )}`
    ];

    if (entry.giftBox) {
      itemParts.push(
        `${copy.giftBoxAddonHeading}:\n${formatNumberedLines(
          buildGiftBoxConfigLines(entry.giftBox.name, entry.giftBox.config, copy)
        )}`
      );
    }

    sections.push(itemParts.join("\n\n"));
  });

  if (cart.standaloneGiftBox) {
    sections.push(
      `${copy.standaloneGiftBoxHeading}:\n${formatNumberedLines(
        buildGiftBoxConfigLines(
          cart.standaloneGiftBox.name,
          cart.standaloneGiftBox.config,
          copy
        )
      )}`
    );
  }

  return sections.join("\n\n---\n\n");
}

export function buildInquiryBundleMessage(bundle: InquiryBundle, copy: ProductInquiryCopy): string {
  const sections: string[] = [];

  if (bundle.handbag) {
    const handbagSection = formatNumberedLines(
      buildHandbagConfigLines(bundle.handbag.name, bundle.handbag.config, copy)
    );
    sections.push(
      bundle.giftBox ? `${copy.handbagAddonHeading}:\n${handbagSection}` : handbagSection
    );
  }

  if (bundle.giftBox) {
    const giftBoxSection = formatNumberedLines(
      buildGiftBoxConfigLines(bundle.giftBox.name, bundle.giftBox.config, copy)
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
