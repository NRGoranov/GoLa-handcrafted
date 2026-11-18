import CookieSettingsButton from "@/components/CookieSettingsButton";
import type { Locale } from "@/lib/i18n";
import { legalCopy } from "@/lib/legal/copy";

type FooterCopy = {
  brandLine: string;
  siteBy: string;
  availabilityLine: string;
};

export default function Footer({ copy, locale }: { copy: FooterCopy; locale: Locale }) {
  const legal = legalCopy[locale];

  return (
    <footer className="container-luxury py-10">
      <div className="flex flex-col gap-3 border-t border-ivory/10 pt-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>{copy.brandLine}</p>
          <p>
            {copy.siteBy}{" "}
            <a
              href="https://www.nrgtrw.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-ivory"
            >
              nrgtrw.com
            </a>
          </p>
        </div>
        <p>{copy.availabilityLine}</p>
      </div>
      <nav aria-label={legal.legalNavLabel} className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-mist">
        <a href={`/${locale}/privacy`} className="focus-ring underline decoration-caramel/40 underline-offset-4 hover:text-ivory">
          {legal.privacyLink}
        </a>
        <a href={`/${locale}/legal`} className="focus-ring underline decoration-caramel/40 underline-offset-4 hover:text-ivory">
          {legal.legalLink}
        </a>
        <CookieSettingsButton label={legal.cookieSettings} />
      </nav>
    </footer>
  );
}
