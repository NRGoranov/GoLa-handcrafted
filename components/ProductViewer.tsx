"use client";

import { useEffect, useState } from "react";
import CmsImage from "@/components/CmsImage";
import {
  intrinsicContainMaxStyle,
  intrinsicSizesProductViewerMain
} from "@/lib/intrinsicImages";

type ProductViewerProps = {
  name: string;
  images: string[];
  copy: {
    aria: {
      viewImage: string;
      viewNamedImage: string;
      thumbnail: string;
    };
  };
  /** When set (e.g. gift box paper color), main image follows this src if it exists in `images`. */
  syncActiveSrc?: string;
};

export default function ProductViewer({ name, images, copy, syncActiveSrc }: ProductViewerProps) {
  const [activeImage, setActiveImage] = useState(
    () => (syncActiveSrc && images.includes(syncActiveSrc) ? syncActiveSrc : images[0]) ?? ""
  );

  useEffect(() => {
    if (!syncActiveSrc || !images.includes(syncActiveSrc)) return;
    setActiveImage((current) => (current === syncActiveSrc ? current : syncActiveSrc));
  }, [syncActiveSrc, images]);

  useEffect(() => {
    if (!images.length) {
      setActiveImage((current) => (current === "" ? current : ""));
      return;
    }
    setActiveImage((current) => (images.includes(current) ? current : images[0]));
  }, [images]);

  if (!images.length || !activeImage) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-black/40 text-sm text-mist">
        No image
      </div>
    );
  }

  const mainMax = intrinsicContainMaxStyle(activeImage);

  return (
    <div className="space-y-4">
      {/* future: replace with GLB viewer */}
      <div
        className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black/40"
        style={mainMax}
      >
        <CmsImage
          src={activeImage}
          alt={copy.aria.viewNamedImage.replace("{name}", name)}
          fill
          className="object-cover"
          sizes={intrinsicSizesProductViewerMain(activeImage)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            className={`focus-ring relative aspect-square overflow-hidden rounded-lg border ${
              activeImage === image ? "border-caramel" : "border-ivory/20"
            }`}
            onClick={() => setActiveImage(image)}
            aria-label={copy.aria.viewImage.replace("{name}", name)}
          >
            <CmsImage
              src={image}
              alt={copy.aria.thumbnail.replace("{name}", name)}
              fill
              className="object-cover"
              sizes="120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
