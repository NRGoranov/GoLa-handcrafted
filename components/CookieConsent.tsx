"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cookieBannerCopy } from "@/lib/legal/copy";
import {
  OPEN_CONSENT_EVENT,
  readConsentChoice,
  writeConsentChoice,
  type ConsentChoice
} from "@/lib/legal/consent";
import type { Locale } from "@/lib/i18n";

function localeFromPath(pathname: string | null): Locale {
  return pathname?.startsWith("/bg") ? "bg" : "en";
}

export default function CookieConsent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, show);
    if (!readConsentChoice()) setOpen(true);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, show);
  }, []);

  if (!open || pathname?.startsWith("/admin")) return null;

  const locale = localeFromPath(pathname);
  const copy = cookieBannerCopy(locale);

  const choose = (choice: ConsentChoice) => {
    writeConsentChoice(choice);
    setOpen(false);
  };

  return (
    <div className="fixed right-4 top-24 z-[70] w-[min(22rem,calc(100%-2rem))] sm:right-6">
      <section
        aria-labelledby="cookie-consent-title"
        className="flex max-h-[min(70vh,24rem)] flex-col gap-4 overflow-y-auto rounded-2xl border border-ivory/15 bg-[#141414] p-5 shadow-luxury"
      >
        <div>
          <h2 id="cookie-consent-title" className="font-serif text-2xl text-ivory">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">{copy.body}</p>
          <Link
            href={`/${locale}/cookies`}
            className="focus-ring mt-2 inline-flex text-sm text-caramel underline decoration-caramel/50 underline-offset-4"
          >
            {copy.policy}
          </Link>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-ivory px-5 py-3 text-sm font-medium text-ink transition-[background-color,transform] duration-100 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            onClick={() => choose("essential")}
          >
            {copy.reject}
          </button>
          <button
            type="button"
            className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-caramel px-5 py-3 text-sm font-medium text-ink transition-[background-color,transform] duration-100 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            onClick={() => choose("all")}
          >
            {copy.accept}
          </button>
        </div>
      </section>
    </div>
  );
}
