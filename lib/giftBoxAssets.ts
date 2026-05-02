/**
 * Gift box imagery: must match `paperColors` order in `lib/i18n.ts` (Ivory → Navy).
 * Hero is the editorial “open + closed” shot for the marketing section and gallery slot 1.
 */
export const GIFT_BOX_HERO_IMAGE = "/images/box/Box_open_and_closed.jpeg";

/** One product photo per paper swatch (same index as `copy.product.options.paperColors`). */
export const GIFT_BOX_PAPER_IMAGE_BY_INDEX = [
  "/images/box/box4-ivory.jpeg",
  "/images/box/box5-cream.jpeg",
  "/images/box/box7-kraft.jpeg",
  "/images/box/box3 - black.jpg",
  "/images/box/box1-blush.jpg",
  "/images/box/box6-navy.jpeg"
] as const;

export function giftBoxImageForPaperColor(index: number): string {
  const i = Math.max(0, Math.min(index, GIFT_BOX_PAPER_IMAGE_BY_INDEX.length - 1));
  return GIFT_BOX_PAPER_IMAGE_BY_INDEX[i];
}

/** Full gallery: hero first, then each paper variant (for thumbnails + consistency). */
export function giftBoxGalleryImages(): string[] {
  return [GIFT_BOX_HERO_IMAGE, ...GIFT_BOX_PAPER_IMAGE_BY_INDEX];
}
