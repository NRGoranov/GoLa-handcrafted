import Link from "next/link";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { legalChrome, legalNav } from "@/lib/legal/copy";
import type { Locale } from "@/lib/i18n";

type FooterCopy = {
  brandLine: string;
  siteBy: string;
  availabilityLine: string;
};

export default function Footer({ copy, locale }: { copy: FooterCopy; locale: Locale }) {
  const nav = legalNav(locale);
  const chrome = legalChrome(locale);

  return (
    <footer className="container-luxury py-10">
      <div className="flex flex-col gap-4 border-t border-ivory/10 pt-6 text-xs text-mist sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p>{copy.brandLine}</p>
          <p>
            {copy.siteBy}{" "}
            <a
              href="https://www.nrgtrw.com"
              target="_blank"
              rel="noreferrer"
              className="focus-ring transition hover:text-ivory"
            >
              nrgtrw.com
            </a>
          </p>
        </div>
        <nav aria-label={chrome.navLabel} className="flex flex-wrap gap-x-4 gap-y-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring underline decoration-ivory/30 underline-offset-4 hover:text-ivory"
            >
              {item.label}
            </Link>
          ))}
          <CookieSettingsButton label={chrome.cookieSettings} />
        </nav>
        <p>{copy.availabilityLine}</p>
      </div>
    </footer>
  );
}
