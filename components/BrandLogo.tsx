"use client";

type BrandLogoTheme = "flat-dark" | "embossed" | "gold" | "espresso";
type BrandLogoBackground = "transparent" | "wood" | "lux-dark" | "light";
type BrandLogoSize = "desktop" | "tablet" | "mobile";

interface BrandLogoProps {
  compact?: boolean;
  compactOnMobile?: boolean;
  theme?: BrandLogoTheme;
  background?: BrandLogoBackground;
  size?: BrandLogoSize;
  className?: string;
}

export default function BrandLogo({
  compact = false,
  compactOnMobile = true,
  theme = "flat-dark",
  background = "transparent",
  size = "desktop",
  className = ""
}: BrandLogoProps) {
  const classes = [
    "brand-logo",
    `brand-logo--${theme}`,
    `brand-logo-bg--${background}`,
    `brand-logo-size--${size}`,
    compact ? "brand-logo--compact" : "",
    compactOnMobile ? "brand-logo--compact-mobile" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} role="img" aria-label="GoLa handcrafted">
      <span className="brand-logo__wordmark" aria-hidden="true">
        <span className="brand-logo__glyph brand-logo__glyph--g">G</span>
        <span className="brand-logo__glyph brand-logo__glyph--o">o</span>
        <span className="brand-logo__glyph brand-logo__glyph--l">L</span>
        <span className="brand-logo__glyph brand-logo__glyph--a">a</span>
      </span>
      {!compact && (
        <span className="brand-logo__subtitle-row" aria-hidden="true">
          <span className="brand-logo__line" />
          <span className="brand-logo__subtitle">handcrafted</span>
          <span className="brand-logo__line" />
        </span>
      )}
    </span>
  );
}
