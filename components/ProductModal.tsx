"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/products";
import ProductViewer from "./ProductViewer";

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
    };
    values: {
      availabilityByInquiry: string;
      customizationYes: string;
      customizationNo: string;
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

  useEffect(() => {
    if (!product) return;
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
                    <dd>EUR {product.priceEur}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.availability}</dt>
                    <dd>{copy.values.availabilityByInquiry}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-caramel">{copy.labels.customization}</dt>
                    <dd>{product.customizable ? copy.values.customizationYes : copy.values.customizationNo}</dd>
                  </div>
                </dl>
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
