"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type PreviewDevice = "desktop" | "phone";

const DEVICE_WIDTH: Record<PreviewDevice, number> = {
  desktop: 1280,
  phone: 390
};

const DEVICE_HEIGHT: Record<PreviewDevice, number> = {
  desktop: 1600,
  phone: 1688
};

type StudioPreviewFrameProps = {
  label: string;
  isDraft: boolean;
  variant?: "section" | "card";
  /** Taller viewport for stacked section layout in Content Studio. */
  expanded?: boolean;
  /** Fit preview into a fixed screen-sized viewport (fills the preview column). */
  screenSized?: boolean;
  /** Allow buttons and modals inside the preview (e.g. gallery). */
  interactive?: boolean;
  children: ReactNode;
};

function fitAspectBox(
  availableW: number,
  availableH: number,
  designWidth: number,
  designHeight: number
) {
  const aspect = designWidth / designHeight;
  let width = availableW;
  let height = width / aspect;

  if (height > availableH) {
    height = availableH;
    width = height * aspect;
  }

  const scale = width / designWidth;
  return { width, height, scale };
}

export default function StudioPreviewFrame({
  label,
  isDraft,
  variant = "section",
  expanded = false,
  screenSized = false,
  interactive = false,
  children
}: StudioPreviewFrameProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [contentHeight, setContentHeight] = useState(0);

  const designWidth = DEVICE_WIDTH[device];
  const designHeight = DEVICE_HEIGHT[device];
  const isCard = variant === "card";
  const blockInteraction =
    interactive
      ? "[&_a]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
      : "[&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none";

  useEffect(() => {
    if (isCard) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const availableW = Math.max(viewport.clientWidth - 4, 200);
      const availableH = Math.max(viewport.clientHeight - 4, 200);

      if (screenSized) {
        if (device === "phone") {
          const fitted = fitAspectBox(availableW, availableH, designWidth, designHeight);
          setDisplaySize({ width: fitted.width, height: fitted.height });
          setScale(fitted.scale);
          return;
        }

        const aspect = designWidth / designHeight;
        const width = availableW;
        const height = width / aspect;
        setDisplaySize({ width, height });
        setScale(width / designWidth);
        return;
      }

      const fitted = fitAspectBox(availableW, availableH, designWidth, designHeight);
      setScale(fitted.scale);
      setDisplaySize({ width: fitted.width, height: fitted.height });
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [designWidth, designHeight, device, isCard, screenSized]);

  useEffect(() => {
    if (isCard || screenSized) return;
    const content = contentRef.current;
    if (!content) return;

    const updateHeight = () => setContentHeight(content.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children, device, isDraft, isCard, screenSized]);

  return (
    <div className={`flex w-full flex-col ${isCard ? "shrink-0" : "h-full min-h-0"}`}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-ivory/10 pb-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-[0.14em] text-mist">{label}</p>
          <p className="text-[10px] text-mist/80">
            {isCard
              ? "Catalog card · actual size"
              : screenSized
                ? device === "desktop"
                  ? `Screen preview (${designWidth}×${designHeight})`
                  : `Phone preview (${designWidth}×${designHeight})`
                : device === "desktop"
                  ? "Desktop layout (1280px)"
                  : "Phone layout (390px)"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isDraft ? (
            <span className="rounded-full border border-dashed border-caramel/50 px-2 py-0.5 text-[10px] text-caramel">
              Editing
            </span>
          ) : (
            <span className="rounded-full bg-caramel/15 px-2 py-0.5 text-[10px] text-caramel">Saved</span>
          )}
          {!isCard ? (
            <div className="flex rounded-full border border-ivory/15 p-0.5 text-[10px]">
              {(["desktop", "phone"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDevice(mode)}
                  className={`rounded-full px-2.5 py-1 capitalize transition-colors duration-200 ${
                    device === mode ? "bg-caramel text-ink" : "text-mist hover:text-ivory"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={viewportRef}
        className={`w-full rounded-xl border border-ivory/10 bg-[#080808] ${
          isCard
            ? "flex shrink-0 items-start justify-center p-3 pb-4"
            : `min-h-0 flex-1 ${
            screenSized
              ? device === "phone"
                ? "flex items-start justify-center overflow-y-auto overflow-x-hidden overscroll-contain p-2"
                : "overflow-y-auto overflow-x-hidden overscroll-contain p-1"
              : `overflow-y-auto overflow-x-hidden overscroll-contain p-1 ${
                  expanded ? "min-h-[min(104vh,1160px)]" : ""
                }`
          }`
        }`}
      >
        {isCard ? (
          <div
            className={`studio-preview-card shrink-0 overflow-hidden rounded-lg bg-ink shadow-2xl ${
              isDraft ? "studio-preview-draft" : "studio-preview-live"
            } ${blockInteraction}`}
          >
            {children}
          </div>
        ) : screenSized ? (
          <div
            className={`studio-preview-screen relative shrink-0 transition-[width,height] duration-300 ease-out ${
              device === "phone" ? "mx-auto" : "w-full"
            }`}
            style={{
              width: device === "phone" && displaySize.width > 0 ? displaySize.width : undefined,
              height: displaySize.height > 0 ? displaySize.height : undefined
            }}
          >
            <div
              ref={contentRef}
              className={`studio-preview-screen-inner origin-top-left overflow-y-auto overflow-x-hidden rounded-lg bg-ink shadow-2xl ${
                isDraft ? "studio-preview-draft" : "studio-preview-live"
              } ${blockInteraction}`}
              style={{
                width: designWidth,
                height: designHeight,
                transform: `scale(${scale})`
              }}
            >
              {children}
            </div>
          </div>
        ) : (
          <div
            className="mx-auto w-full transition-[width,height] duration-300 ease-out"
            style={{
              width: displaySize.width > 0 ? displaySize.width : designWidth * scale,
              height: contentHeight > 0 ? contentHeight * scale : displaySize.height || undefined
            }}
          >
            <div
              ref={contentRef}
              className={`studio-preview-screen-inner origin-top-left rounded-lg bg-ink shadow-2xl ${
                interactive ? "overflow-visible" : "overflow-hidden"
              } ${isDraft ? "studio-preview-draft" : "studio-preview-live"} ${blockInteraction}`}
              style={{
                width: designWidth,
                transform: `scale(${scale})`
              }}
            >
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
