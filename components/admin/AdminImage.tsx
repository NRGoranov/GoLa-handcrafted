"use client";

import { useEffect, useState } from "react";
import CmsImage from "@/components/CmsImage";

type AdminImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
};

export default function AdminImage({ src, alt, fill, className, sizes }: AdminImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src.trim()) {
    return (
      <div className="flex h-full min-h-[4rem] items-center justify-center bg-black/40 text-[10px] text-mist">
        No image
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-full min-h-[4rem] flex-col items-center justify-center gap-1 bg-black/40 p-2 text-center text-[10px] text-red-200">
        <span>Image failed to load</span>
        <span className="line-clamp-2 break-all text-mist">{src}</span>
      </div>
    );
  }

  return (
    <CmsImage
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      loading="eager"
      priority
      onError={() => setFailed(true)}
    />
  );
}
