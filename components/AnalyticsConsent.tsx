"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_KEY,
  OPEN_CONSENT_EVENT,
  type AnalyticsConsent
} from "@/lib/analytics-consent";
import { legalCopy } from "@/lib/legal/copy";
import type { Locale } from "@/lib/i18n";

function localeFromPath(pathname: string): Locale {
  return pathname === "/bg" || pathname.startsWith("/bg/") ? "bg" : "en";
}

export default function AnalyticsConsent() {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPath(pathname);
  const copy = legalCopy[locale];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const saved = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    setOpen(saved !== "accepted" && saved !== "rejected");
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, [pathname]);

  if (!open || pathname.startsWith("/admin")) return null;

  const choose = (value: AnalyticsConsent) => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    setOpen(false);
    window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: value }));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-ivory/15 bg-[#141414] p-4 text-ivory shadow-luxury sm:p-6">
      <div className="container-luxury flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-3xl text-sm leading-relaxed text-mist">
          {copy.banner}{" "}
          <a href={`/${locale}/privacy`} className="focus-ring underline decoration-caramel/70 underline-offset-4">
            {copy.privacyLink}
          </a>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="focus-ring min-h-11 flex-1 rounded-full border border-ivory/30 px-5 text-sm sm:flex-none"
            onClick={() => choose("rejected")}
          >
            {copy.reject}
          </button>
          <button
            type="button"
            className="focus-ring min-h-11 flex-1 rounded-full border border-ivory/30 px-5 text-sm sm:flex-none"
            onClick={() => choose("accepted")}
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
