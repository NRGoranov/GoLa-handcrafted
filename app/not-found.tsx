import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import BrandLogo from "@/components/BrandLogo";
import { isLocale, type Locale } from "@/lib/i18n";

const copy = {
  en: {
    eyebrow: "Page not found",
    title: "This piece is not in the collection",
    body: "The page you opened has moved, or the link does not match anything we make.",
    home: "Return home",
    collection: "View the collection"
  },
  bg: {
    eyebrow: "Страницата не е намерена",
    title: "Този модел не е в колекцията",
    body: "Страницата, която отворихте, е преместена или връзката не съответства на нито едно наше изделие.",
    home: "Към началото",
    collection: "Вижте колекцията"
  }
} as const;

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false }
};

function resolveLocale(): Locale {
  const headerLocale = headers().get("x-gola-locale");
  if (headerLocale && isLocale(headerLocale)) return headerLocale;
  const cookieLocale = cookies().get("site_locale")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;
  return "en";
}

export default function NotFound() {
  const locale = resolveLocale();
  const text = copy[locale];

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-ink text-ivory">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-caramel/10 blur-3xl"
      />
      <div className="container-luxury relative flex w-full flex-col items-center py-24 text-center">
        <a href={`/${locale}`} className="focus-ring mb-10 inline-flex" aria-label="Gola Handcrafted">
          <BrandLogo theme="gold" background="transparent" size="desktop" compactOnMobile={false} />
        </a>
        <p className="text-[11px] uppercase tracking-[0.32em] text-caramel">{text.eyebrow}</p>
        <p className="mt-5 font-serif text-7xl leading-none text-ivory sm:text-8xl">404</p>
        <h1 className="mt-6 max-w-xl font-serif text-3xl leading-tight text-ivory sm:text-5xl">{text.title}</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-mist sm:text-base">{text.body}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`/${locale}`}
            className="focus-ring inline-flex min-h-11 items-center rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink transition hover:bg-[#c99d6b]"
          >
            {text.home}
          </a>
          <a
            href={`/${locale}#collection`}
            className="focus-ring inline-flex min-h-11 items-center rounded-full border border-ivory/50 px-6 py-3 text-sm text-ivory transition hover:border-caramel hover:text-caramel"
          >
            {text.collection}
          </a>
        </div>
      </div>
    </main>
  );
}
