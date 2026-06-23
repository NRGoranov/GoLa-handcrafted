import Image from "next/image";

export function isRemoteImageSrc(src: string | null | undefined): boolean {
  return typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://"));
}

type CmsImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  onError?: () => void;
};

/** Product/section images — local paths use next/image; Supabase and other URLs use a plain img tag. */
export default function CmsImage({
  src,
  alt,
  fill,
  className,
  sizes,
  loading = "lazy",
  priority,
  onError
}: CmsImageProps) {
  const normalizedSrc = typeof src === "string" ? src.trim() : "";

  if (!normalizedSrc) {
    return (
      <div
        className={
          fill
            ? `absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-mist ${className ?? ""}`
            : `flex min-h-[4rem] items-center justify-center bg-black/40 text-xs text-mist ${className ?? ""}`
        }
        aria-hidden={!alt}
      >
        No image
      </div>
    );
  }

  if (isRemoteImageSrc(normalizedSrc)) {
    const remoteClass = fill
      ? `absolute inset-0 h-full w-full object-cover ${className ?? ""}`
      : (className ?? "h-full w-full object-cover");

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalizedSrc}
        alt={alt}
        className={remoteClass}
        loading={priority ? "eager" : loading}
        onError={onError}
      />
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      loading={loading}
      priority={priority}
      onError={onError}
    />
  );
}
