import Image from "next/image";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  onView: (product: Product) => void;
  copy: {
    viewDetails: string;
    aria: { viewDetailsFor: string };
  };
};

export default function ProductCard({ product, onView, copy }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-ivory/15 bg-[#111]">
      <button
        type="button"
        className="focus-ring relative aspect-[4/5] overflow-hidden text-left"
        onClick={() => onView(product)}
        aria-label={copy.aria.viewDetailsFor.replace("{name}", product.name)}
      >
        <Image
          src={product.images[0]}
          alt={`${product.name} handcrafted bag`}
          fill
          className="object-cover transition duration-300 hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-2xl text-ivory">{product.name}</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-caramel/90">
          EUR {product.priceEur}
        </p>
        <p className="mt-3 flex-1 text-sm text-mist">{product.description}</p>
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
