import {
  addHandbagToCart,
  cloneGiftBoxConfig,
  cloneHandbagConfig,
  type InquiryCart,
  type InquiryCartAddon,
  type InquiryCartHandbagEntry,
  setStandaloneGiftBoxOnCart
} from "@/lib/inquiry-cart";
import type { InquiryMetaState } from "@/lib/product-configuration-storage";
import type {
  GiftBoxConfigurationState,
  HandbagConfigurationState
} from "@/lib/product-inquiry-prefill";
import { type Product, isGiftBox, isHandbag } from "@/lib/products";

export function commitHandbagSelectionToCart(
  cart: InquiryCart,
  args: {
    handbagId: string;
    handbagName: string;
    handbagConfig: HandbagConfigurationState;
    includeGiftBox: boolean;
    giftBoxProduct: Product | null;
    giftBoxConfig: GiftBoxConfigurationState;
    earring?: InquiryCartHandbagEntry["earring"];
  }
): InquiryCart {
  return addHandbagToCart(cart, {
    handbagId: args.handbagId,
    handbagName: args.handbagName,
    config: cloneHandbagConfig(args.handbagConfig),
    giftBox:
      args.includeGiftBox && args.giftBoxProduct
        ? {
            name: args.giftBoxProduct.name,
            config: cloneGiftBoxConfig(args.giftBoxConfig)
          }
        : null,
    earring: args.earring ?? null
  });
}

export function commitStandaloneGiftBoxToCart(
  cart: InquiryCart,
  args: {
    giftBoxName: string;
    giftBoxConfig: GiftBoxConfigurationState;
    earring?: InquiryCartAddon | null;
  }
): InquiryCart {
  return setStandaloneGiftBoxOnCart(cart, {
    name: args.giftBoxName,
    config: cloneGiftBoxConfig(args.giftBoxConfig),
    earring: args.earring ?? null
  });
}

function buildEarringCartEntry(
  includeEarrings: boolean,
  selectedEarring: Product | null,
  earringConfig: HandbagConfigurationState
): InquiryCartHandbagEntry["earring"] {
  if (!includeEarrings || !selectedEarring || !isHandbag(selectedEarring)) return null;
  return {
    id: selectedEarring.id,
    name: selectedEarring.name,
    config: cloneHandbagConfig(earringConfig)
  };
}

export function commitModalToCart(
  cart: InquiryCart,
  args: {
    product: Product;
    handbagConfig: HandbagConfigurationState;
    giftBoxConfig: GiftBoxConfigurationState;
    modelGiftBoxConfig: GiftBoxConfigurationState;
    earringConfig: HandbagConfigurationState;
    meta: InquiryMetaState;
    giftBoxProduct: Product | null;
    selectedHandbag: Product | null;
    selectedEarring: Product | null;
  }
): InquiryCart {
  const { product, meta, giftBoxProduct, selectedHandbag, selectedEarring } = args;
  const earringEntry = buildEarringCartEntry(meta.includeEarrings, selectedEarring, args.earringConfig);

  if (isHandbag(product)) {
    return commitHandbagSelectionToCart(cart, {
      handbagId: product.id,
      handbagName: product.name,
      handbagConfig: args.handbagConfig,
      includeGiftBox: meta.includeGiftBox,
      giftBoxProduct,
      giftBoxConfig: args.giftBoxConfig,
      earring: earringEntry
    });
  }

  if (isGiftBox(product)) {
    if (meta.includeHandbag && selectedHandbag && isHandbag(selectedHandbag)) {
      return commitHandbagSelectionToCart(cart, {
        handbagId: selectedHandbag.id,
        handbagName: selectedHandbag.name,
        handbagConfig: args.handbagConfig,
        includeGiftBox: meta.includeGiftBox,
        giftBoxProduct: giftBoxProduct ?? product,
        giftBoxConfig: args.modelGiftBoxConfig,
        earring: earringEntry
      });
    }

    return commitStandaloneGiftBoxToCart(cart, {
      giftBoxName: product.name,
      giftBoxConfig: args.giftBoxConfig,
      earring: earringEntry
    });
  }

  return cart;
}
