"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const links = [
  { href: "#collection", label: "Collection" },
  { href: "#craftsmanship", label: "Craftsmanship" },
  { href: "#custom", label: "Custom" },
  { href: "#inquiry", label: "Inquiry" }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      const passedHero = y > Math.max(window.innerHeight - 140, 220);
      document.documentElement.setAttribute("data-hero-passed", String(passedHero));
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
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "bg-ink/95 shadow-luxury backdrop-blur-md" : "bg-transparent"
      }`}
      aria-label="Primary"
    >
      <div className="mx-auto flex h-20 w-[96%] items-center justify-between sm:w-[95%] lg:w-[94%] xl:w-[92%]">
        <a href="#top" className="focus-ring inline-flex h-full items-center text-ivory">
          <Image
            src="/images/logo.png"
            alt="GoLa handcrafted logo"
            width={999}
            height={333}
            className="h-[300%] w-auto max-w-[500px] object-contain sm:max-w-[580px]"
            priority
            unoptimized
          />
        </a>

        <ul className="hidden items-center gap-[clamp(1rem,2.2vw,2.5rem)] md:flex">
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

        <button
          type="button"
          className="focus-ring inline-flex items-center rounded-full border border-ivory/30 px-4 py-2 text-xs md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          Menu
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden ${menuOpen ? "block" : "hidden"} border-t border-ivory/10 bg-ink/95`}
      >
        <ul className="mx-auto flex w-[96%] flex-col py-4 sm:w-[95%]">
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
