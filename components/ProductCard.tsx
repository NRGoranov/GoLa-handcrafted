import CmsImage from "@/components/CmsImage";
import { intrinsicContainMaxStyle, intrinsicSizesProductCard } from "@/lib/intrinsicImages";
import type { Locale } from "@/lib/i18n";
import { priceCaption } from "@/lib/legal/prices";
import { type Product, isGiftBox } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  summary: string;
  onView: (product: Product) => void;
  copy: {
    viewDetails: string;
    aria: { viewDetailsFor: string };
  };
  locale?: Locale;
};

export default function ProductCard({ product, summary, onView, copy, locale = "en" }: ProductCardProps) {
  const heroSrc = product.images.find((url) => typeof url === "string" && url.trim()) ?? "";
  const maxStyle = heroSrc ? intrinsicContainMaxStyle(heroSrc) : undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ivory/15 bg-[#111]">
      <button
        type="button"
        className="focus-ring relative mx-auto aspect-[4/5] w-full overflow-hidden text-left"
        style={maxStyle}
        onClick={() => onView(product)}
        aria-label={copy.aria.viewDetailsFor.replace("{name}", product.name)}
      >
        <CmsImage
          src={heroSrc || undefined}
          alt={
            isGiftBox(product)
              ? `${product.name} — handmade wooden packaging`
              : `${product.name} handcrafted bag`
          }
          fill
          className="object-cover"
          sizes={heroSrc ? intrinsicSizesProductCard(heroSrc) : undefined}
        />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-2xl text-ivory">{product.name}</h3>
        <p className="mt-1 text-xs text-caramel/90">
          <span className="uppercase tracking-[0.18em]">EUR {product.priceEur}</span>
          <span className="mt-1 block text-[11px] normal-case tracking-normal text-mist">
            {priceCaption(locale)}
          </span>
        </p>
        <p className="mt-3 text-sm text-mist">{summary}</p>
        <button
          type="button"
          className="focus-ring mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-caramel px-4 py-2 text-sm text-caramel transition hover:bg-caramel hover:text-ink"
          onClick={() => onView(product)}
        >
          {copy.viewDetails}
        </button>
      </div>
    </article>
  );
}
