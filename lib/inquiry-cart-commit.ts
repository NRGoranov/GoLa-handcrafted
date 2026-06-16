import {
  addHandbagToCart,
  cloneGiftBoxConfig,
  cloneHandbagConfig,
  type InquiryCart,
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
        : null
  });
}

export function commitStandaloneGiftBoxToCart(
  cart: InquiryCart,
  args: {
    giftBoxName: string;
    giftBoxConfig: GiftBoxConfigurationState;
  }
): InquiryCart {
  return setStandaloneGiftBoxOnCart(cart, {
    name: args.giftBoxName,
    config: cloneGiftBoxConfig(args.giftBoxConfig)
  });
}

export function commitModalToCart(
  cart: InquiryCart,
  args: {
    product: Product;
    handbagConfig: HandbagConfigurationState;
    giftBoxConfig: GiftBoxConfigurationState;
    modelGiftBoxConfig: GiftBoxConfigurationState;
    meta: InquiryMetaState;
    giftBoxProduct: Product | null;
    selectedHandbag: Product | null;
  }
): InquiryCart {
  const { product, meta, giftBoxProduct, selectedHandbag } = args;

  if (isHandbag(product)) {
    return commitHandbagSelectionToCart(cart, {
      handbagId: product.id,
      handbagName: product.name,
      handbagConfig: args.handbagConfig,
      includeGiftBox: meta.includeGiftBox,
      giftBoxProduct,
      giftBoxConfig: args.giftBoxConfig
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
        giftBoxConfig: args.modelGiftBoxConfig
      });
    }

    return commitStandaloneGiftBoxToCart(cart, {
      giftBoxName: product.name,
      giftBoxConfig: args.giftBoxConfig
    });
  }

  return cart;
}
