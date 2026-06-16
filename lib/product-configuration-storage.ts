import {
  defaultGiftBoxConfiguration,
  defaultHandbagConfiguration,
  defaultProductConfigurationState,
  type GiftBoxConfigurationState,
  type HandbagConfigurationState,
  type ProductConfigurationState
} from "@/lib/product-inquiry-prefill";

const GIFT_BOX_STORAGE_KEY = "gola-config-giftbox";
const MODEL_GIFT_BOX_STORAGE_KEY = "gola-config-giftbox-for-model";
const META_STORAGE_KEY = "gola-config-inquiry-meta";
const handbagStorageKey = (handbagId: string) => `gola-config-handbag-${handbagId}`;

export type InquiryMetaState = {
  includeGiftBox: boolean;
  includeHandbag: boolean;
  selectedHandbagId: string;
};

export const defaultInquiryMeta: InquiryMetaState = {
  includeGiftBox: false,
  includeHandbag: false,
  selectedHandbagId: defaultProductConfigurationState.selectedHandbagId
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadHandbagConfiguration(handbagId: string): HandbagConfigurationState {
  const stored = readJson<Partial<HandbagConfigurationState>>(handbagStorageKey(handbagId));
  return stored ? { ...defaultHandbagConfiguration, ...stored } : { ...defaultHandbagConfiguration };
}

export function saveHandbagConfiguration(
  handbagId: string,
  config: HandbagConfigurationState
): void {
  writeJson(handbagStorageKey(handbagId), config);
}

export function loadGiftBoxConfiguration(): GiftBoxConfigurationState {
  const stored = readJson<Partial<GiftBoxConfigurationState>>(GIFT_BOX_STORAGE_KEY);
  return stored ? { ...defaultGiftBoxConfiguration, ...stored } : { ...defaultGiftBoxConfiguration };
}

export function saveGiftBoxConfiguration(config: GiftBoxConfigurationState): void {
  writeJson(GIFT_BOX_STORAGE_KEY, config);
}

export function loadModelGiftBoxConfiguration(): GiftBoxConfigurationState {
  const stored = readJson<Partial<GiftBoxConfigurationState>>(MODEL_GIFT_BOX_STORAGE_KEY);
  return stored ? { ...defaultGiftBoxConfiguration, ...stored } : { ...defaultGiftBoxConfiguration };
}

export function saveModelGiftBoxConfiguration(config: GiftBoxConfigurationState): void {
  writeJson(MODEL_GIFT_BOX_STORAGE_KEY, config);
}

export function loadInquiryMeta(fallbackHandbagId?: string): InquiryMetaState {
  const stored = readJson<Partial<InquiryMetaState>>(META_STORAGE_KEY);
  return {
    includeGiftBox: stored?.includeGiftBox ?? defaultInquiryMeta.includeGiftBox,
    includeHandbag: stored?.includeHandbag ?? defaultInquiryMeta.includeHandbag,
    selectedHandbagId:
      stored?.selectedHandbagId ?? fallbackHandbagId ?? defaultInquiryMeta.selectedHandbagId
  };
}

export function saveInquiryMeta(meta: InquiryMetaState): void {
  writeJson(META_STORAGE_KEY, meta);
}

/** One-time read when a modal opens — handbag and gift box configs are stored separately. */
export function loadModalConfiguration(
  productId: string,
  productKind: "handbag" | "giftBox",
  fallbackHandbagId?: string
): {
  handbag: HandbagConfigurationState;
  giftBox: GiftBoxConfigurationState;
  meta: InquiryMetaState;
} {
  const meta = loadInquiryMeta(fallbackHandbagId);
  const handbagId = productKind === "handbag" ? productId : meta.selectedHandbagId;

  return {
    handbag: loadHandbagConfiguration(handbagId),
    giftBox: loadGiftBoxConfiguration(),
    meta
  };
}

export function saveModalHandbagConfiguration(
  handbagId: string,
  config: HandbagConfigurationState
): void {
  saveHandbagConfiguration(handbagId, config);
}

export function saveModalGiftBoxConfiguration(config: GiftBoxConfigurationState): void {
  saveGiftBoxConfiguration(config);
}

export function toProductConfigurationState(
  handbag: HandbagConfigurationState,
  giftBox: GiftBoxConfigurationState,
  meta: InquiryMetaState
): ProductConfigurationState {
  return {
    handbag,
    giftBox,
    includeGiftBox: meta.includeGiftBox,
    includeHandbag: meta.includeHandbag,
    selectedHandbagId: meta.selectedHandbagId
  };
}
