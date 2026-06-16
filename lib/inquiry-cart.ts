import type {
  GiftBoxConfigurationState,
  HandbagConfigurationState
} from "@/lib/product-inquiry-prefill";

const CART_STORAGE_KEY = "gola-inquiry-cart";

export const INQUIRY_CART_CHANGED_EVENT = "gola:inquiry-cart-changed";

export type InquiryCartHandbagEntry = {
  id: string;
  handbagId: string;
  handbagName: string;
  config: HandbagConfigurationState;
  giftBox: {
    name: string;
    config: GiftBoxConfigurationState;
  } | null;
};

export type InquiryCart = {
  handbags: InquiryCartHandbagEntry[];
  standaloneGiftBox: {
    name: string;
    config: GiftBoxConfigurationState;
  } | null;
};

export function emptyInquiryCart(): InquiryCart {
  return { handbags: [], standaloneGiftBox: null };
}

function newEntryId(): string {
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readCart(): InquiryCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InquiryCart;
  } catch {
    return null;
  }
}

export function loadInquiryCart(): InquiryCart {
  const stored = readCart();
  if (!stored) return emptyInquiryCart();
  return {
    handbags: Array.isArray(stored.handbags) ? stored.handbags : [],
    standaloneGiftBox: stored.standaloneGiftBox ?? null
  };
}

export function saveInquiryCart(cart: InquiryCart): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(INQUIRY_CART_CHANGED_EVENT));
}

export function clearInquiryCart(): void {
  saveInquiryCart(emptyInquiryCart());
}

export function getInquiryCartCount(cart: InquiryCart): number {
  return cart.handbags.length + (cart.standaloneGiftBox ? 1 : 0);
}

export function addHandbagToCart(
  cart: InquiryCart,
  entry: {
    handbagId: string;
    handbagName: string;
    config: HandbagConfigurationState;
    giftBox: InquiryCartHandbagEntry["giftBox"];
  }
): InquiryCart {
  return {
    ...cart,
    handbags: [
      ...cart.handbags,
      {
        id: newEntryId(),
        handbagId: entry.handbagId,
        handbagName: entry.handbagName,
        config: entry.config,
        giftBox: entry.giftBox
      }
    ]
  };
}

export function setStandaloneGiftBoxOnCart(
  cart: InquiryCart,
  box: InquiryCart["standaloneGiftBox"]
): InquiryCart {
  return { ...cart, standaloneGiftBox: box };
}

export function removeHandbagFromCart(cart: InquiryCart, entryId: string): InquiryCart {
  return {
    ...cart,
    handbags: cart.handbags.filter((entry) => entry.id !== entryId)
  };
}

export function removeStandaloneGiftBoxFromCart(cart: InquiryCart): InquiryCart {
  return { ...cart, standaloneGiftBox: null };
}

export function cloneGiftBoxConfig(config: GiftBoxConfigurationState): GiftBoxConfigurationState {
  return { ...config };
}

export function cloneHandbagConfig(config: HandbagConfigurationState): HandbagConfigurationState {
  return { ...config };
}
