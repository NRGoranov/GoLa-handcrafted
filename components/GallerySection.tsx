"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_PREVIEW_COUNT } from "@/lib/galleryConstants";
import { flattenGalleryImages, type GalleryImageGroup } from "@/lib/galleryTypes";
import SectionHeading from "./SectionHeading";
import {
  intrinsicSizesProductCard,
  intrinsicSizesProductViewerMain
} from "@/lib/intrinsicImages";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

type GalleryCopy = {
  eyebrow: string;
  title: string;
  description: string;
  sectionAria: string;
  imageAlt: string;
  viewAll: string;
  viewImage: string;
  openGallery: string;
  backToGallery: string;
  previousImage: string;
  nextImage: string;
  zoomIn: string;
  zoomOut: string;
  closeGallery: string;
  modalAria: string;
  focusedViewAria: string;
};

function CloseGalleryButton({
  label,
  onClose,
  className = ""
}: {
  label: string;
  onClose: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      className={`focus-ring inline-flex min-h-10 items-center justify-center rounded-full border border-caramel bg-caramel/95 px-5 py-2 text-sm font-medium text-ink shadow-luxury backdrop-blur-sm transition hover:bg-caramel [@media(max-height:480px)]:min-h-9 [@media(max-height:480px)]:px-4 [@media(max-height:480px)]:py-1.5 [@media(max-height:480px)]:text-xs sm:min-h-11 sm:px-6 sm:py-2.5 ${className}`}
    >
      {label}
    </button>
  );
}

function galleryAlt(copy: GalleryCopy, index: number) {
  return copy.imageAlt.replace("{n}", String(index + 1));
}

function GalleryTile({
  src,
  alt,
  ariaLabel,
  onClick,
  index,
  eager = false
}: {
  src: string;
  alt: string;
  ariaLabel: string;
  onClick: () => void;
  index: number;
  eager?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      data-gallery-index={index}
      className="focus-ring relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-ivory/10 bg-[#141414] transition hover:border-caramel/50"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={intrinsicSizesProductCard(src)}
        loading={eager ? "eager" : "lazy"}
      />
    </button>
  );
}

function GalleryGrid({
  images,
  copy,
  onSelectImage,
  previewMode = false,
  indexOffset = 0
}: {
  images: readonly string[];
  copy: GalleryCopy;
  onSelectImage: (index: number) => void;
  previewMode?: boolean;
  indexOffset?: number;
}) {
  return (
    <>
      {images.map((src, index) => {
        const globalIndex = indexOffset + index;
        return (
          <li key={`${src}-${globalIndex}`}>
            <GalleryTile
              src={src}
              alt={galleryAlt(copy, globalIndex)}
              ariaLabel={
                previewMode
                  ? copy.openGallery
                  : copy.viewImage.replace("{n}", String(globalIndex + 1))
              }
              onClick={() => onSelectImage(globalIndex)}
              index={globalIndex}
              eager={globalIndex < 4}
            />
          </li>
        );
      })}
    </>
  );
}

function GalleryGroupedGrid({
  groups,
  copy,
  onSelectImage
}: {
  groups: GalleryImageGroup[];
  copy: GalleryCopy;
  onSelectImage: (index: number) => void;
}) {
  let indexOffset = 0;

  return (
    <div className="space-y-10 pb-2">
      {groups.map((group, groupIndex) => {
        const startIndex = indexOffset;
        indexOffset += group.images.length;

        return (
          <section key={group.id} aria-labelledby={`gallery-group-${groupIndex}`}>
            {groupIndex > 0 ? (
              <div className="mb-8 border-t border-ivory/10" aria-hidden />
            ) : null}
            <p
              id={`gallery-group-${groupIndex}`}
              className="mb-4 text-xs uppercase tracking-[0.22em] text-caramel/85"
            >
              {group.label}
            </p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
              <GalleryGrid
                images={group.images}
                copy={copy}
                indexOffset={startIndex}
                onSelectImage={onSelectImage}
              />
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function GalleryFocusedView({
  src,
  alt,
  copy,
  onBack,
  onPrevious,
  onNext
}: {
  src: string;
  alt: string;
  copy: GalleryCopy;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const zoomAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const clampPan = useCallback((x: number, y: number, scale: number) => {
    const frame = frameRef.current;
    if (!frame || scale <= 1) return { x: 0, y: 0 };

    const maxX = (frame.clientWidth * (scale - 1)) / 2;
    const maxY = (frame.clientHeight * (scale - 1)) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }, []);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [src]);

  useEffect(() => {
    if (zoom <= 1) {
      setPan({ x: 0, y: 0 });
      return;
    }
    setPan((current) => clampPan(current.x, current.y, zoom));
  }, [zoom, clampPan]);

  useEffect(() => {
    const onResize = () => {
      setPan((current) => clampPan(current.x, current.y, zoom));
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [clampPan, zoom]);

  const zoomIn = useCallback(() => {
    setZoom((value) => Math.min(ZOOM_MAX, Number((value + ZOOM_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((value) => Math.max(ZOOM_MIN, Number((value - ZOOM_STEP).toFixed(2))));
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (zoom <= 1) return;

      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        panX: pan.x,
        panY: pan.y
      };
    },
    [pan.x, pan.y, zoom]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      event.stopPropagation();
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      setPan(clampPan(drag.panX + dx, drag.panY + dy, zoom));
    },
    [clampPan, zoom]
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const el = zoomAreaRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY < 0) zoomIn();
      else zoomOut();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomIn, zoomOut]);

  const canPan = zoom > 1;
  const navButtonClass =
    "focus-ring absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ivory/20 bg-[#111]/80 text-xl text-ivory shadow-luxury backdrop-blur-sm transition hover:border-caramel hover:text-caramel [@media(max-height:480px)]:h-8 [@media(max-height:480px)]:w-8 [@media(max-height:480px)]:text-lg sm:h-12 sm:w-12 sm:text-2xl";

  return (
    <motion.div
      key="focus"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-ivory/10 px-3 py-2 [@media(max-height:480px)]:px-2 [@media(max-height:480px)]:py-1.5 sm:gap-3 sm:px-7 sm:py-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onBack();
          }}
            className="focus-ring inline-flex min-h-9 max-w-[54vw] items-center gap-1.5 rounded-full border border-ivory/20 px-2.5 py-1.5 text-xs text-ivory transition hover:border-caramel hover:text-caramel [@media(max-height:480px)]:max-w-10 [@media(max-height:480px)]:px-2 sm:min-h-10 sm:max-w-none sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
        >
          <span aria-hidden className="text-lg leading-none">
            ←
          </span>
          <span className="truncate [@media(max-height:480px)]:sr-only">
            {copy.backToGallery}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            aria-label={copy.previousImage}
            className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-lg text-ivory transition hover:border-caramel hover:text-caramel sm:inline-flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label={copy.nextImage}
            className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-lg text-ivory transition hover:border-caramel hover:text-caramel sm:inline-flex"
          >
            ›
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              zoomOut();
            }}
            disabled={zoom <= ZOOM_MIN}
            aria-label={copy.zoomOut}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-base text-ivory transition hover:border-caramel hover:text-caramel disabled:cursor-not-allowed disabled:opacity-40 [@media(max-height:480px)]:h-8 [@media(max-height:480px)]:w-8 sm:h-10 sm:w-10 sm:text-lg"
          >
            −
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              zoomIn();
            }}
            disabled={zoom >= ZOOM_MAX}
            aria-label={copy.zoomIn}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-base text-ivory transition hover:border-caramel hover:text-caramel disabled:cursor-not-allowed disabled:opacity-40 [@media(max-height:480px)]:h-8 [@media(max-height:480px)]:w-8 sm:h-10 sm:w-10 sm:text-lg"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={zoomAreaRef}
        className="relative flex min-h-0 flex-1 cursor-zoom-out items-center justify-center overflow-hidden px-2 py-2 [@media(max-height:480px)]:py-1 sm:px-16 sm:py-5"
        onClick={onBack}
        role="presentation"
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPrevious();
          }}
          aria-label={copy.previousImage}
          className={`${navButtonClass} left-2 sm:left-5`}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          aria-label={copy.nextImage}
          className={`${navButtonClass} right-2 sm:right-5`}
        >
          ›
        </button>
        <div
          ref={frameRef}
          className={`relative mx-auto h-full min-h-0 w-full max-w-full overflow-hidden rounded-xl touch-none ${
            canPan ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className={`relative h-full w-full origin-center will-change-transform ${
              isDragging ? "" : "transition-transform duration-150 ease-out"
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="pointer-events-none object-contain select-none"
              sizes={intrinsicSizesProductViewerMain(src)}
              priority
              draggable={false}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function GallerySection({
  copy,
  groups
}: {
  copy: GalleryCopy;
  groups: GalleryImageGroup[];
}) {
  const images = flattenGalleryImages(groups);
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const restoreFocusedIndexRef = useRef<number | null>(null);
  const previewImages = images.slice(0, GALLERY_PREVIEW_COUNT);
  const hasMore = images.length > GALLERY_PREVIEW_COUNT;

  const closeGallery = useCallback(() => {
    setOpen(false);
    setFocusedIndex(null);
    restoreFocusedIndexRef.current = null;
  }, []);

  const openGalleryGrid = useCallback(() => {
    setOpen(true);
    setFocusedIndex(null);
  }, []);

  const focusImage = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const focusPreviousImage = useCallback(() => {
    setFocusedIndex((current) => {
      if (current === null || images.length === 0) return current;
      return current === 0 ? images.length - 1 : current - 1;
    });
  }, [images.length]);

  const focusNextImage = useCallback(() => {
    setFocusedIndex((current) => {
      if (current === null || images.length === 0) return current;
      return current === images.length - 1 ? 0 : current + 1;
    });
  }, [images.length]);

  const restoreGridScroll = useCallback(() => {
    const indexToRestore = restoreFocusedIndexRef.current;
    if (indexToRestore === null) return;

    const scroller = gridScrollRef.current;
    const target = scroller?.querySelector<HTMLElement>(
      `[data-gallery-index="${indexToRestore}"]`
    );
    if (!scroller || !target) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const centeredTop =
      scroller.scrollTop +
      targetRect.top -
      scrollerRect.top -
      (scroller.clientHeight - targetRect.height) / 2;

    scroller.scrollTo({ top: Math.max(0, centeredTop), behavior: "auto" });
    restoreFocusedIndexRef.current = null;
  }, []);

  const backToGrid = useCallback(() => {
    restoreFocusedIndexRef.current = focusedIndex;
    restoreGridScroll();
    setFocusedIndex(null);
  }, [focusedIndex, restoreGridScroll]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (focusedIndex !== null && event.key === "ArrowLeft") {
        event.preventDefault();
        focusPreviousImage();
        return;
      }
      if (focusedIndex !== null && event.key === "ArrowRight") {
        event.preventDefault();
        focusNextImage();
        return;
      }
      if (event.key !== "Escape") return;
      if (focusedIndex !== null) {
        backToGrid();
        return;
      }
      closeGallery();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [backToGrid, closeGallery, focusNextImage, focusPreviousImage, focusedIndex, open]);

  useEffect(() => {
    if (!open || focusedIndex !== null || restoreFocusedIndexRef.current === null) return;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        restoreGridScroll();
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusedIndex, open, restoreGridScroll]);

  if (images.length === 0) return null;

  const focusedSrc = focusedIndex !== null ? images[focusedIndex] : null;
  const isFocused = focusedIndex !== null && focusedSrc;

  return (
    <>
      <section
        id="gallery"
        aria-label={copy.sectionAria}
        className="border-y border-ivory/10 bg-[#0f0f0f] py-20 sm:py-24"
      >
        <div className="container-luxury">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <GalleryGrid
              images={previewImages}
              copy={copy}
              previewMode
              onSelectImage={() => openGalleryGrid()}
            />
          </ul>

          {hasMore ? (
            <motion.div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={openGalleryGrid}
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-caramel px-6 py-2.5 text-sm text-caramel transition hover:bg-caramel hover:text-ink"
              >
                {copy.viewAll}
              </button>
            </motion.div>
          ) : null}
        </div>
      </section>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isFocused ? backToGrid : closeGallery}
            aria-modal="true"
            role="dialog"
            aria-label={isFocused ? copy.focusedViewAria : copy.modalAria}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-ivory/15 bg-[#111] sm:h-[90dvh] sm:max-w-6xl sm:rounded-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative flex min-h-0 flex-1">
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isFocused ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                  className={`flex min-h-0 flex-1 flex-col ${
                    isFocused ? "pointer-events-none" : ""
                  }`}
                  aria-hidden={isFocused ? true : undefined}
                >
                  <div
                    ref={gridScrollRef}
                    className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7"
                  >
                    <GalleryGroupedGrid
                      groups={groups}
                      copy={copy}
                      onSelectImage={focusImage}
                    />
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isFocused ? (
                    <motion.div
                      key="focus"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 flex min-h-0 flex-col"
                    >
                      <GalleryFocusedView
                        src={focusedSrc}
                        alt={galleryAlt(copy, focusedIndex)}
                        copy={copy}
                        onBack={backToGrid}
                        onPrevious={focusPreviousImage}
                        onNext={focusNextImage}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="flex shrink-0 justify-center border-t border-ivory/10 bg-[#111] px-4 py-2.5 [@media(max-height:480px)]:py-1.5 sm:px-7 sm:py-4">
                <CloseGalleryButton label={copy.closeGallery} onClose={closeGallery} />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
