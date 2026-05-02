"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavbarCopy = {
  links: {
    collection: string;
    giftBox: string;
    craftsmanship: string;
    custom: string;
    inquiry: string;
  };
  menu: string;
  openMenuAria: string;
  closeMenuAria: string;
  goToTop: string;
  homeAria: string;
  languageLabel: string;
};

const sectionLinks = [
  { href: "#collection", key: "collection" as const },
  { href: "#craftsmanship", key: "craftsmanship" as const },
  { href: "#gift-box", key: "giftBox" as const },
  { href: "#custom", key: "custom" as const },
  { href: "#inquiry", key: "inquiry" as const }
];

export default function Navbar({ copy, locale }: { copy: NavbarCopy; locale: "en" | "bg" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
      const y = window.scrollY;
      // Navbar chrome + scrollbar stay hidden only at the utmost top; any scroll shows both.
      const atTop = y < 1;
      setScrolled(!atTop);
      document.documentElement.setAttribute("data-hero-passed", String(!atTop));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeAttribute("data-hero-passed");
    };
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 ease-out ${
        scrolled ? "wood-navbar shadow-luxury" : "bg-transparent shadow-none"
      }`}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-20 w-[96%] items-center justify-between sm:w-[95%] lg:w-[94%] xl:w-[92%]">
        <a href="#top" className="focus-ring sr-only text-ivory">
          {copy.goToTop}
        </a>

        <a
          href="#top"
          className={`focus-ring inline-flex items-center transition-opacity duration-500 ease-out ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
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
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ring text-sm text-ivory/85 transition hover:text-caramel"
              >
                {copy.links[link.key]}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
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
          className="focus-ring inline-flex items-center rounded-full border border-ivory/30 px-4 py-2 text-xs md:hidden"
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
              className="focus-ring inline-flex items-center rounded-full border border-ivory/30 px-3 py-1.5 text-xs text-ivory/85 transition hover:text-caramel"
              aria-label={otherLocale === "bg" ? "Switch to Bulgarian" : "Switch to English"}
              onClick={() => setMenuOpen(false)}
            >
              {otherLocale.toUpperCase()}
            </a>
          </li>
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ring block py-3 text-sm text-ivory/85 transition hover:text-caramel"
                onClick={() => setMenuOpen(false)}
              >
                {copy.links[link.key]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
