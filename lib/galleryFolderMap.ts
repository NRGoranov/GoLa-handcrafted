import { type GalleryGroupLabels } from "./galleryTypes";

export const GALLERY_ROOT_GROUP_KEY = "other" as const;

/** First group in the modal gallery. */
export const GALLERY_FIRST_GROUP_KEY = "whiteBagMm" as const;

/** Maps `public/images/gallery` subfolder names (as on disk) to i18n group keys. */
export const GALLERY_FOLDER_TO_GROUP_KEY: Record<string, keyof GalleryGroupLabels> = {
  "Бяла чанта ММ": "whiteBagMm",
  Балове: "proms",
  "Кафява чанта Жана": "brownBagJana",
  "Кафява чатна ЛП": "brownBagLp",
  "Малка кафява клъч": "smallBrownClutch",
  "Черна чанта син хастар": "blackBagBlueLining",
  Кутии: "boxes"
};

/** Display order for known groups; unknown folders follow at the end. */
export const GALLERY_GROUP_SORT_ORDER: (keyof GalleryGroupLabels)[] = [
  "whiteBagMm",
  "proms",
  "brownBagJana",
  "brownBagLp",
  "smallBrownClutch",
  "blackBagBlueLining",
  "boxes",
  GALLERY_ROOT_GROUP_KEY
];

export function galleryGroupKeyForFolder(
  relativeDir: string
): keyof GalleryGroupLabels | string {
  if (!relativeDir) return GALLERY_ROOT_GROUP_KEY;
  return GALLERY_FOLDER_TO_GROUP_KEY[relativeDir] ?? relativeDir;
}

export function resolveGalleryGroupLabel(
  groupKey: keyof GalleryGroupLabels | string,
  relativeDir: string,
  labels: GalleryGroupLabels,
  formatUnknownFolder: (dir: string) => string
): string {
  if (groupKey === GALLERY_ROOT_GROUP_KEY) return labels.other;
  if (groupKey in labels) return labels[groupKey as keyof GalleryGroupLabels];
  return formatUnknownFolder(relativeDir || String(groupKey));
}

export function galleryGroupSortIndex(groupKey: keyof GalleryGroupLabels | string): number {
  const index = GALLERY_GROUP_SORT_ORDER.indexOf(groupKey as keyof GalleryGroupLabels);
  if (index !== -1) return index;
  return GALLERY_GROUP_SORT_ORDER.length + 1;
}
