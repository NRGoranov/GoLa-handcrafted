export type GalleryGroupRecord = {
  id: string;
  labelEn: string;
  labelBg: string;
  sortOrder: number;
  images: string[];
  updatedAt: string;
};

export type GalleryGroupInput = {
  labelEn: string;
  labelBg: string;
  sortOrder: number;
  images: string[];
};
