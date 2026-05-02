/**
 * Native pixel dimensions for **product photography only** (models 1–4 + gift box).
 * Used to cap layout and `sizes` so those assets are never upscaled. Other site images
 * (hero, craftsmanship, logo, etc.) are unconstrained.
 */
const INTRINSIC: Record<string, { w: number; h: number }> = {
  "/images/box/Box_open_and_closed.jpeg": { w: 1024, h: 1024 },
  "/images/box/box4-ivory.jpeg": { w: 1200, h: 896 },
  "/images/box/box5-cream.jpeg": { w: 1200, h: 896 },
  "/images/box/box7-kraft.jpeg": { w: 1024, h: 1024 },
  "/images/box/box3 - black.jpg": { w: 1280, h: 1024 },
  "/images/box/box1-blush.jpg": { w: 1280, h: 1024 },
  "/images/box/box6-navy.jpeg": { w: 1200, h: 896 },
  "/images/model1/model1-1.jpeg": { w: 1600, h: 1200 },
  "/images/model1/model1-2.jpeg": { w: 1600, h: 1200 },
  "/images/model1/model1-3.jpeg": { w: 960, h: 1280 },
  "/images/model1/model1-4.jpeg": { w: 1600, h: 900 },
  "/images/model1/model1-5.jpeg": { w: 1200, h: 1600 },
  "/images/model1/model1-6.jpeg": { w: 1600, h: 1200 },
  "/images/model2/model2-1.jpeg": { w: 1600, h: 1200 },
  "/images/model2/model2-2.jpeg": { w: 1600, h: 1200 },
  "/images/model2/model2-3.jpeg": { w: 2048, h: 1152 },
  "/images/model2/model2-4.jpeg": { w: 2048, h: 1536 },
  "/images/model3/model3-1.jpeg": { w: 1600, h: 1200 },
  "/images/model3/model3-2.jpeg": { w: 1600, h: 1200 },
  "/images/model3/model3-3.jpeg": { w: 2048, h: 1152 },
  "/images/model3/model3-4.jpeg": { w: 1600, h: 900 },
  "/images/model3/model3-5.jpeg": { w: 2048, h: 1536 },
  "/images/model4/model4-1.jpeg": { w: 1600, h: 1200 },
  "/images/model4/model4-2.jpeg": { w: 960, h: 1280 }
};

export function intrinsicMaxWidthPx(src: string): number | undefined {
  return INTRINSIC[src]?.w;
}

/** Caps layout width for product/box photos only; returns undefined for other paths. */
export function intrinsicContainMaxStyle(src: string): { maxWidth: string } | undefined {
  const w = intrinsicMaxWidthPx(src);
  if (!w) return undefined;
  return { maxWidth: `min(100%, ${w}px)` };
}

/** `sizes` for product grid cards — unconstrained fallback when src is not a catalogued product photo. */
export function intrinsicSizesProductCard(src: string): string {
  const w = intrinsicMaxWidthPx(src);
  if (!w) return "(max-width: 768px) 100vw, 33vw";
  return `(max-width: 768px) min(100vw, ${w}px), min(33vw, ${w}px)`;
}

/** Gift box section / similar half-width product imagery. */
export function intrinsicSizesHalfWidthGrid(src: string): string {
  const w = intrinsicMaxWidthPx(src);
  if (!w) return "(max-width: 768px) 100vw, 50vw";
  return `(max-width: 768px) min(100vw, ${w}px), min(50vw, ${w}px)`;
}

export function intrinsicSizesProductViewerMain(src: string): string {
  const w = intrinsicMaxWidthPx(src);
  if (!w) return "(max-width: 768px) 100vw, 45vw";
  return `(max-width: 768px) min(100vw, ${w}px), min(45vw, ${w}px)`;
}
