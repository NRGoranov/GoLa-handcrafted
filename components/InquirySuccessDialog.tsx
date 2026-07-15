"use client";

import { useEffect, useRef } from "react";

type InquirySuccessDialogCopy = {
  title: string;
  message: string;
  close: string;
};

type InquirySuccessDialogProps = {
  open: boolean;
  onClose: () => void;
  copy: InquirySuccessDialogCopy;
};

export default function InquirySuccessDialog({
  open,
  onClose,
  copy
}: InquirySuccessDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-success-title"
        aria-describedby="inquiry-success-message"
        className="w-full max-w-md rounded-t-3xl border border-ivory/15 bg-[#111] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 shadow-2xl sm:rounded-2xl sm:px-8 sm:py-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-caramel/15 text-caramel">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 id="inquiry-success-title" className="text-center font-serif text-2xl text-ivory">
          {copy.title}
        </h2>
        <p id="inquiry-success-message" className="mt-3 text-center text-base leading-relaxed text-mist">
          {copy.message}
        </p>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="focus-ring mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink transition hover:bg-caramel/90"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
}
