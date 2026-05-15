"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_PREVIEW_COUNT } from "@/lib/galleryConstants";
import SectionHeading from "./SectionHeading";
import {
  intrinsicContainMaxStyle,
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
      className={`focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-caramel bg-caramel/95 px-6 py-2.5 text-sm font-medium text-ink shadow-luxury backdrop-blur-sm transition hover:bg-caramel ${className}`}
    >
      {label}
    </button>
  );
}

function galleryAlt(copy: GalleryCopy, index: number) {
  return copy.imageAlt.replace("{n}", String(index + 1));
}

function GalleryGrid({
  images,
  copy,
  onSelectImage,
  previewMode = false
}: {
  images: readonly string[];
  copy: GalleryCopy;
  onSelectImage: (index: number) => void;
  previewMode?: boolean;
}) {
  return (
    <>
      {images.map((src, index) => (
        <li key={`${src}-${index}`}>
          <button
            type="button"
            onClick={() => onSelectImage(index)}
            aria-label={
              previewMode ? copy.openGallery : copy.viewImage.replace("{n}", String(index + 1))
            }
            className="focus-ring relative block aspect-[4/5] w-full overflow-hidden rounded-xl border border-ivory/10 bg-[#141414] transition hover:border-caramel/50"
          >
            <Image
              src={src}
              alt={galleryAlt(copy, index)}
              fill
              className="object-cover"
              sizes={intrinsicSizesProductCard(src)}
              loading={index < 4 ? "eager" : "lazy"}
            />
          </button>
        </li>
      ))}
    </>
  );
}

function GalleryFocusedView({
  src,
  alt,
  copy,
  onBack
}: {
  src: string;
  alt: string;
  copy: GalleryCopy;
  onBack: () => void;
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

  return (
    <motion.div
      key="focus"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ivory/10 px-5 py-3 sm:px-7">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onBack();
          }}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full border border-ivory/20 px-3 py-2 text-sm text-ivory transition hover:border-caramel hover:text-caramel"
        >
          <span aria-hidden className="text-lg leading-none">
            ←
          </span>
          {copy.backToGallery}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              zoomOut();
            }}
            disabled={zoom <= ZOOM_MIN}
            aria-label={copy.zoomOut}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-lg text-ivory transition hover:border-caramel hover:text-caramel disabled:cursor-not-allowed disabled:opacity-40"
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
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-lg text-ivory transition hover:border-caramel hover:text-caramel disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={zoomAreaRef}
        className="flex min-h-0 flex-1 cursor-zoom-out items-center justify-center overflow-hidden px-5 py-5 sm:px-7"
        onClick={onBack}
        role="presentation"
      >
        <div
          ref={frameRef}
          className={`relative mx-auto aspect-[4/5] w-full max-h-[min(62vh,680px)] overflow-hidden rounded-xl touch-none ${
            canPan ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          style={intrinsicContainMaxStyle(src)}
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
  images
}: {
  copy: GalleryCopy;
  images: string[];
}) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previewImages = images.slice(0, GALLERY_PREVIEW_COUNT);
  const hasMore = images.length > GALLERY_PREVIEW_COUNT;

  const closeGallery = useCallback(() => {
    setOpen(false);
    setFocusedIndex(null);
  }, []);

  const openGalleryGrid = useCallback(() => {
    setOpen(true);
    setFocusedIndex(null);
  }, []);

  const focusImage = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const backToGrid = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (focusedIndex !== null) {
        setFocusedIndex(null);
        return;
      }
      closeGallery();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeGallery, focusedIndex, open]);

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
              className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-ivory/15 bg-[#111] sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {isFocused ? (
                  <GalleryFocusedView
                    src={focusedSrc}
                    alt={galleryAlt(copy, focusedIndex)}
                    copy={copy}
                    onBack={backToGrid}
                  />
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                      <ul className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                        <GalleryGrid
                          images={images}
                          copy={copy}
                          onSelectImage={focusImage}
                        />
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex shrink-0 justify-center border-t border-ivory/10 bg-[#111] px-5 py-4 sm:px-7">
                <CloseGalleryButton label={copy.closeGallery} onClose={closeGallery} />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
