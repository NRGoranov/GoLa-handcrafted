"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  const [activeImage, setActiveImage] = useState(() =>
    syncActiveSrc && images.includes(syncActiveSrc) ? syncActiveSrc : images[0]
  );

  useEffect(() => {
    if (syncActiveSrc && images.includes(syncActiveSrc)) {
      setActiveImage(syncActiveSrc);
    }
  }, [syncActiveSrc, images]);

  const mainMax = intrinsicContainMaxStyle(activeImage);

  return (
    <div className="space-y-4">
      {/* future: replace with GLB viewer */}
      <div
        className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black/40"
        style={mainMax}
      >
        <Image
          src={activeImage}
          alt={copy.aria.viewNamedImage.replace("{name}", name)}
          fill
          className="object-cover"
          sizes={intrinsicSizesProductViewerMain(activeImage)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            className={`focus-ring relative aspect-square overflow-hidden rounded-lg border ${
              activeImage === image ? "border-caramel" : "border-ivory/20"
            }`}
            onClick={() => setActiveImage(image)}
            aria-label={copy.aria.viewImage.replace("{name}", name)}
          >
            <Image
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
