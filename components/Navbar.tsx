"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { assemblyFinished, replayAssembly } from "@/lib/hero-sequence";

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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const showChrome = scrolled || menuOpen;
  const chromeVisibility = showChrome
    ? "pointer-events-auto opacity-100"
    : "pointer-events-none opacity-0";
  const otherLocale = locale === "en" ? "bg" : "en";
  const switchHref = (() => {
    if (!pathname) return `/${otherLocale}`;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return `/${otherLocale}`;
    if (parts[0] === "en" || parts[0] === "bg") parts[0] = otherLocale;
    return `/${parts.join("/")}`;
  })();

  useEffect(() => {
    const onScroll = () => {
      const done = assemblyFinished();
      setScrolled(done);
      if (!done) setMenuOpen(false);
      document.documentElement.setAttribute("data-hero-passed", String(done));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.documentElement.removeAttribute("data-hero-passed");
    };
  }, []);

  const replay = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setMenuOpen(false);
    replayAssembly();
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50" aria-label="Primary">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 wood-navbar shadow-luxury transition-opacity duration-500 ease-out ${
          showChrome ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="relative mx-auto flex h-20 w-[96%] items-center justify-between sm:w-[95%] lg:w-[94%] xl:w-[92%]">
        <a
          href="#top"
          className={`focus-ring inline-flex items-center transition-opacity duration-500 ease-out ${chromeVisibility}`}
          aria-hidden={!showChrome}
          tabIndex={showChrome ? undefined : -1}
          aria-label={copy.homeAria}
          onClick={replay}
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

        <ul
          className={`hidden items-center gap-[clamp(1rem,2.2vw,2.5rem)] transition-opacity duration-500 ease-out md:flex ${chromeVisibility}`}
          aria-hidden={!showChrome}
          inert={!showChrome}
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ring text-sm text-ivory/85 transition hover:text-caramel"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          className={`hidden items-center gap-3 transition-opacity duration-500 ease-out md:flex ${chromeVisibility}`}
          aria-hidden={!showChrome}
          inert={!showChrome}
        >
          <button
            type="button"
            onClick={replay}
            aria-label={copy.replayAria}
            className="focus-ring text-sm text-ivory/85 transition hover:text-caramel"
          >
            {copy.replay}
          </button>
          <span className="text-xs uppercase tracking-[0.16em] text-ivory/60">{copy.languageLabel}</span>
          <a
            href={switchHref}
            className="focus-ring inline-flex items-center rounded-full border border-ivory/30 px-3 py-1.5 text-xs text-ivory/85 transition hover:text-caramel"
            aria-label={otherLocale === "bg" ? "Switch to Bulgarian" : "Switch to English"}
          >
            {otherLocale.toUpperCase()}
          </a>
        </div>

        <button
          type="button"
          className={`focus-ring inline-flex items-center rounded-full border border-ivory/30 px-4 py-2 text-xs transition-opacity duration-500 ease-out md:hidden ${chromeVisibility}`}
          aria-hidden={!showChrome}
          tabIndex={showChrome ? undefined : -1}
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
          <li>
            <button
              type="button"
              onClick={replay}
              aria-label={copy.replayAria}
              className="focus-ring block py-3 text-sm text-ivory/85 transition hover:text-caramel"
            >
              {copy.replay}
            </button>
          </li>
          <li className="flex items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-[0.16em] text-ivory/60">{copy.languageLabel}</span>
            <a
              href={switchHref}
              className="focus-ring inline-flex items-center rounded-full border border-ivory/30 px-3 py-1.5 text-xs text-ivory/85 transition hover:text-caramel"
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
                className="focus-ring block py-3 text-sm text-ivory/85 transition hover:text-caramel"
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
