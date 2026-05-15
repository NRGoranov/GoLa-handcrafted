export type GalleryGroupLabels = {
  other: string;
  whiteBagMm: string;
  brownBagJana: string;
  brownBagLp: string;
  smallBrownClutch: string;
  blackBagBlueLining: string;
  boxes: string;
};

export type GalleryImageGroup = {
  id: string;
  label: string;
  images: string[];
};

export function flattenGalleryImages(groups: GalleryImageGroup[]): string[] {
  return groups.flatMap((group) => group.images);
}
