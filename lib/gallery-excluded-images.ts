/** Gallery photos that show inside pockets — hidden from the public site and sync. */
const GALLERY_EXCLUDED_IMAGE_SUFFIXES = [
  // Кафява чатна ЛП
  "_22668c2d23e.jpg",
  "_22668c2a36b.jpg",
  "_22484813e34.jpg",
  "_22669f99604_1.jpg",
  // Кафява чанта Жана
  "_22613fe8123.jpg",
  "_22768f6b573.jpg",
  "_2212996ebef.jpg",
  "_22768f91600.jpg",
  "_22768f9f527.jpg",
  "_22768f9e55f.jpg",
  "_22768f99688.jpg",
  "_22768f90688.jpg",
  "_22768f90886.jpg",
  // Черна чанта син хастар
  "_224820e5943.jpg",
  "_224b8a35943.jpg"
] as const;

export function isExcludedGalleryImage(url: string): boolean {
  const decoded = decodeURIComponent(url);
  return GALLERY_EXCLUDED_IMAGE_SUFFIXES.some((suffix) => decoded.endsWith(suffix));
}

export function filterGalleryImages(images: string[]): string[] {
  return images.filter((url) => !isExcludedGalleryImage(url));
}
