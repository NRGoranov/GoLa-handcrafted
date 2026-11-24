"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavbarCopy = {
  menu: string;
  openMenuAria: string;
  closeMenuAria: string;
  goToTop: string;
  homeAria: string;
  languageLabel: string;
  replay: string;
  replayAria: string;
};

export type NavbarLink = {
  href: string;
  label: string;
};

export default function Navbar({
  copy,
  locale,
  links
}: {
  copy: NavbarCopy;
  locale: "en" | "bg";
  links: NavbarLink[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const otherLocale = locale === "en" ? "bg" : "en";
  const switchHref = (() => {
    if (!pathname) return `/${otherLocale}`;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return `/${otherLocale}`;
    if (parts[0] === "en" || parts[0] === "bg") parts[0] = otherLocale;
    return `/${parts.join("/")}`;
  })();

  return (
    <nav className="fixed inset-x-0 top-0 z-50" aria-label="Primary">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 wood-navbar shadow-luxury" />
      <div className="relative mx-auto flex h-20 w-[96%] items-center justify-between sm:w-[95%] lg:w-[94%] xl:w-[92%]">
        <a
          href="#top"
          className="focus-ring inline-flex items-center"
          aria-label={copy.homeAria}
        >
          <Image
            src="/images/backgroundsLogo-removebg.png"
            alt="Gola Handcrafted logo"
            width={300}
            height={95}
            className="h-12 w-auto object-contain sm:h-14"
            priority
          />
        </a>

        <ul className="hidden items-center gap-[clamp(1rem,2.2vw,2.5rem)] md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ring inline-flex min-h-11 items-center text-sm text-ivory/85 transition-colors duration-150 ease-out hover:text-caramel"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-xs uppercase tracking-[0.16em] text-ivory/60">{copy.languageLabel}</span>
          <a
            href={switchHref}
            className="focus-ring inline-flex min-h-11 items-center rounded-full border border-ivory/30 px-3 text-xs text-ivory/85 transition-colors duration-150 ease-out hover:text-caramel"
            aria-label={otherLocale === "bg" ? "Switch to Bulgarian" : "Switch to English"}
          >
            {otherLocale.toUpperCase()}
          </a>
        </div>

        <button
          type="button"
          className="focus-ring inline-flex min-h-11 items-center rounded-full border border-ivory/30 px-4 text-xs md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? copy.closeMenuAria : copy.openMenuAria}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {copy.menu}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden ${menuOpen ? "block" : "hidden"} wood-navbar border-t border-ivory/10`}
      >
        <ul className="mx-auto flex w-[96%] flex-col gap-2 py-4 sm:w-[95%]">
          <li className="flex items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-[0.16em] text-ivory/60">{copy.languageLabel}</span>
            <a
              href={switchHref}
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-ivory/30 px-3 text-xs text-ivory/85 transition-colors duration-150 ease-out hover:text-caramel"
              aria-label={otherLocale === "bg" ? "Switch to Bulgarian" : "Switch to English"}
              onClick={() => setMenuOpen(false)}
            >
              {otherLocale.toUpperCase()}
            </a>
          </li>
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ring block min-h-11 py-3 text-sm text-ivory/85 transition-colors duration-150 ease-out hover:text-caramel"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
