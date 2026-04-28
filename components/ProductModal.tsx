"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/products";
import ProductViewer from "./ProductViewer";

type ProductCustomizationState = {
  liningColor: number;
  woodCoatingColor: number;
  chainColor: number;
  insidePockets: boolean;
  customEngraving: boolean;
};

const defaultCustomizationState: ProductCustomizationState = {
  liningColor: 0,
  woodCoatingColor: 0,
  chainColor: 0,
  insidePockets: false,
  customEngraving: false
};

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
  copy: {
    close: string;
    requestThisPiece: string;
    labels: {
      model: string;
      dimensions: string;
      dimensionsHint: string;
      price: string;
      availability: string;
      customization: string;
      inside: string;
      liningColor: string;
      insidePockets: string;
      engraving: string;
      woodCoatingColor: string;
      chainColor: string;
    };
    values: {
      availabilityByInquiry: string;
      customizationYes: string;
      customizationNo: string;
      insideLeather: string;
    };
    options: {
      colors: string[];
      woodCoatingColors: string[];
      chainColors: string[];
      pocketsAdds: string; // "{amount}" placeholder
      engravingAdds: string; // "{amount}" placeholder
    };
    aria: {
      modalLabel: string;
      viewImage: string;
      viewNamedImage: string;
      thumbnail: string;
    };
  };
};

export default function ProductModal({ product, onClose, copy }: ProductModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const optionsGroupId = useId();
  const [liningColor, setLiningColor] = useState(0);
  const [woodCoatingColor, setWoodCoatingColor] = useState(0);
  const [chainColor, setChainColor] = useState(0);
  const [insidePockets, setInsidePockets] = useState(false);
  const [customEngraving, setCustomEngraving] = useState(false);

  const liningSwatches = [
    "#d8c3a5",
    "#556b2f",
    "#6b1f2b",
    "#0f766e",
    "#d8a7b1",
    "#0b0b0b",
    "#36454f",
    "#ff7f50",
    "#8b5a2b"
  ] as const;
  const woodCoatingSwatches = ["#d6b88f", "#6b4a2f", "#5a2a27", "#111111"] as const;
  const chainSwatches = ["#d4af37", "#c0c0c0", "#cd7f32", "#0b0b0b"] as const;

  useEffect(() => {
    if (!product) {
      return;
    }

    const storageKey = `product-customization-${product.id}`;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setLiningColor(defaultCustomizationState.liningColor);
        setWoodCoatingColor(defaultCustomizationState.woodCoatingColor);
        setChainColor(defaultCustomizationState.chainColor);
        setInsidePockets(defaultCustomizationState.insidePockets);
        setCustomEngraving(defaultCustomizationState.customEngraving);
      } else {
        const parsed = JSON.parse(raw) as Partial<ProductCustomizationState>;
        setLiningColor(parsed.liningColor ?? defaultCustomizationState.liningColor);
        setWoodCoatingColor(parsed.woodCoatingColor ?? defaultCustomizationState.woodCoatingColor);
        setChainColor(parsed.chainColor ?? defaultCustomizationState.chainColor);
        setInsidePockets(parsed.insidePockets ?? defaultCustomizationState.insidePockets);
        setCustomEngraving(parsed.customEngraving ?? defaultCustomizationState.customEngraving);
      }
    } catch {
      setLiningColor(defaultCustomizationState.liningColor);
      setWoodCoatingColor(defaultCustomizationState.woodCoatingColor);
      setChainColor(defaultCustomizationState.chainColor);
      setInsidePockets(defaultCustomizationState.insidePockets);
      setCustomEngraving(defaultCustomizationState.customEngraving);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !modalRef.current) return;

      const selectors =
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusables = modalRef.current.querySelectorAll<HTMLElement>(selectors);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product, onClose]);

  useEffect(() => {
    if (!product) return;
    const storageKey = `product-customization-${product.id}`;
    const payload: ProductCustomizationState = {
      liningColor,
      woodCoatingColor,
      chainColor,
      insidePockets,
      customEngraving
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [product, liningColor, woodCoatingColor, chainColor, insidePockets, customEngraving]);

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label={copy.aria.modalLabel.replace("{name}", product.name)}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-[92vh] w-full overflow-auto rounded-t-2xl border border-ivory/15 bg-[#111] p-5 sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h3 className="font-serif text-3xl text-ivory">{product.name}</h3>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring rounded-full border border-ivory/20 px-3 py-1.5 text-sm text-ivory"
              >
                {copy.close}
              </button>
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              <ProductViewer
                name={product.name}
                images={product.images}
                copy={{ aria: copy.aria }}
              />
              <div className="space-y-5">
                <p className="text-mist">{product.description}</p>
                <dl className="space-y-2 text-sm text-ivory/90">
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.model}</dt>
                    <dd>{product.model}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.dimensions}</dt>
                    <dd>
                      <span className="block text-xs uppercase tracking-[0.14em] text-mist">
                        {copy.labels.dimensionsHint}
                      </span>
                      {product.dimensions}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.price}</dt>
                    <dd>
                      EUR{" "}
                      {product.priceEur +
                        (insidePockets ? product.pocketsAddOnEur : 0) +
                        (customEngraving ? product.engravingAddOnEur : 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.availability}</dt>
                    <dd>{copy.values.availabilityByInquiry}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.customization}</dt>
                    <dd>{product.customizable ? copy.values.customizationYes : copy.values.customizationNo}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.inside}</dt>
                    <dd>{copy.values.insideLeather}</dd>
                  </div>
                </dl>

                <div className="rounded-2xl border border-ivory/10 bg-black/20 p-4">
                  <fieldset className="space-y-3">
                    <legend className="text-xs uppercase tracking-[0.16em] text-mist">
                      {copy.labels.liningColor}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {copy.options.colors.map((label, index) => {
                        const isActive = liningColor === index;
                        return (
                          <button
                            key={`${optionsGroupId}-color-${label}`}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => setLiningColor(index)}
                            className={`focus-ring grid min-h-11 grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border px-4 py-2 text-sm ${
                              isActive
                                ? "border-caramel bg-caramel/10 text-ivory"
                                : "border-ivory/15 bg-transparent text-ivory/85 hover:border-ivory/30"
                            }`}
                          >
                            <span className="min-w-0 truncate text-left">{label}</span>
                            <span
                              aria-hidden="true"
                              className="h-4 w-4 rounded-full border border-ivory/25"
                              style={{ backgroundColor: liningSwatches[index] ?? "#808080" }}
                            />
                            <span
                              aria-hidden="true"
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                                isActive ? "border-caramel bg-caramel text-ink" : "border-ivory/30"
                              }`}
                            >
                              {isActive ? "✓" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="mt-4 space-y-3">
                    <legend className="text-xs uppercase tracking-[0.16em] text-mist">
                      {copy.labels.woodCoatingColor}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {copy.options.woodCoatingColors.map((label, index) => {
                        const isActive = woodCoatingColor === index;
                        return (
                          <button
                            key={`${optionsGroupId}-wood-${label}`}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => setWoodCoatingColor(index)}
                            className={`focus-ring grid min-h-11 grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border px-4 py-2 text-sm ${
                              isActive
                                ? "border-caramel bg-caramel/10 text-ivory"
                                : "border-ivory/15 bg-transparent text-ivory/85 hover:border-ivory/30"
                            }`}
                          >
                            <span className="min-w-0 truncate text-left">{label}</span>
                            <span
                              aria-hidden="true"
                              className="h-4 w-4 rounded-full border border-ivory/25"
                              style={{ backgroundColor: woodCoatingSwatches[index] ?? "#808080" }}
                            />
                            <span
                              aria-hidden="true"
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                                isActive ? "border-caramel bg-caramel text-ink" : "border-ivory/30"
                              }`}
                            >
                              {isActive ? "✓" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="mt-4 space-y-3">
                    <legend className="text-xs uppercase tracking-[0.16em] text-mist">
                      {copy.labels.chainColor}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {copy.options.chainColors.map((label, index) => {
                        const isActive = chainColor === index;
                        return (
                          <button
                            key={`${optionsGroupId}-chain-${label}`}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => setChainColor(index)}
                            className={`focus-ring grid min-h-11 grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border px-4 py-2 text-sm ${
                              isActive
                                ? "border-caramel bg-caramel/10 text-ivory"
                                : "border-ivory/15 bg-transparent text-ivory/85 hover:border-ivory/30"
                            }`}
                          >
                            <span className="min-w-0 truncate text-left">{label}</span>
                            <span
                              aria-hidden="true"
                              className="h-4 w-4 rounded-full border border-ivory/25"
                              style={{ backgroundColor: chainSwatches[index] ?? "#808080" }}
                            />
                            <span
                              aria-hidden="true"
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                                isActive ? "border-caramel bg-caramel text-ink" : "border-ivory/30"
                              }`}
                            >
                              {isActive ? "✓" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <label className="mt-4 flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[#b78b5a]"
                      checked={insidePockets}
                      onChange={(event) => setInsidePockets(event.target.checked)}
                    />
                    <span className="text-sm text-ivory/90">
                      <span className="font-medium text-caramel">{copy.labels.insidePockets}</span>{" "}
                      <span className="text-mist">
                        ({copy.options.pocketsAdds.replace("{amount}", String(product.pocketsAddOnEur))})
                      </span>
                    </span>
                  </label>

                  <label className="mt-3 flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[#b78b5a]"
                      checked={customEngraving}
                      onChange={(event) => setCustomEngraving(event.target.checked)}
                    />
                    <span className="text-sm text-ivory/90">
                      <span className="font-medium text-caramel">{copy.labels.engraving}</span>{" "}
                      <span className="text-mist">
                        ({copy.options.engravingAdds.replace("{amount}", String(product.engravingAddOnEur))})
                      </span>
                    </span>
                  </label>
                </div>

                <a
                  href="#inquiry"
                  onClick={onClose}
                  className="focus-ring inline-flex min-h-11 items-center rounded-full bg-caramel px-5 py-2.5 text-sm font-medium text-ink"
                >
                  {copy.requestThisPiece}
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
