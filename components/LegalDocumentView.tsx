import Link from "next/link";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { legalChrome, legalNav, type LegalDocument } from "@/lib/legal/copy";
import type { Locale } from "@/lib/i18n";

export default function LegalDocumentView({
  locale,
  document
}: {
  locale: Locale;
  document: LegalDocument;
}) {
  const chrome = legalChrome(locale);
  const nav = legalNav(locale);

  return (
    <>
      <a href="#legal-content" className="focus-ring sr-only focus:not-sr-only">
        {locale === "bg" ? "Към съдържанието" : "Skip to content"}
      </a>
      <header className="container-luxury flex items-center justify-between gap-4 py-8">
        <Link href={`/${locale}`} className="focus-ring font-serif text-2xl text-ivory">
          Gola Handcrafted
        </Link>
        <Link
          href={`/${locale}`}
          className="focus-ring text-sm text-mist underline decoration-ivory/30 underline-offset-4 hover:text-ivory"
        >
          {chrome.backHome}
        </Link>
      </header>
      <main id="legal-content" className="container-luxury pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-caramel">
          {chrome.updatedLabel} {document.updated}
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl text-ivory sm:text-5xl">{document.title}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-mist sm:text-base">{document.intro}</p>
        <div className="mt-10 max-w-3xl space-y-9">
          {document.sections.map((section) => (
            <section key={section.heading} id={section.id}>
              <h2 className="font-serif text-2xl text-ivory">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-relaxed text-ivory/85 sm:text-base">
                  {paragraph}
                </p>
              ))}
              {section.items ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ivory/85 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </main>
      <footer className="container-luxury pb-12">
        <nav aria-label={chrome.navLabel} className="flex flex-wrap gap-x-5 gap-y-2 border-t border-ivory/10 pt-6 text-xs text-mist">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring underline decoration-ivory/30 underline-offset-4 hover:text-ivory">
              {item.label}
            </Link>
          ))}
          <CookieSettingsButton label={chrome.cookieSettings} />
        </nav>
      </footer>
    </>
  );
}
