import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import { getCopy, type Locale } from "@/lib/i18n";
import { legalCopy } from "@/lib/legal/copy";

export default function LegalChrome({
  locale,
  path,
  children
}: {
  locale: Locale;
  path: "/privacy" | "/legal";
  children: ReactNode;
}) {
  const copy = legalCopy[locale];
  const other: Locale = locale === "en" ? "bg" : "en";

  return (
    <>
      <header className="border-b border-ivory/10">
        <div className="container-luxury flex items-center justify-between gap-4 py-6">
          <a href={`/${locale}`} className="focus-ring font-serif text-xl text-ivory">
            Gola Handcrafted
          </a>
          <a
            href={`/${other}${path}`}
            className="focus-ring rounded-full border border-ivory/30 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ivory/80"
            hrefLang={other}
          >
            {other}
          </a>
        </div>
      </header>
      <main id="main-content" className="container-luxury max-w-3xl py-16">
        {children}
      </main>
      <Footer copy={getCopy(locale).footer} locale={locale} />
    </>
  );
}
