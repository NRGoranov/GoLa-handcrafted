"use client";

import {
  boundValuePreview,
  cloneProductDetails,
  createCustomProductDetail,
  detachProductDetail,
  effectiveProductDetails,
  insideMaterialDetail,
  moveProductDetail
} from "@/lib/products/product-details";
import type { ProductDetail, ProductKind } from "@/types/product-record";

type ProductDetailsEditorProps = {
  productId: string;
  productKind: ProductKind;
  model: number | null;
  dimensions: string;
  priceEur: number;
  details: ProductDetail[] | null;
  onChange: (details: ProductDetail[] | null) => void;
};

const BINDING_NOTE: Record<NonNullable<ProductDetail["binding"]>, string> = {
  model: "Follows the model number above.",
  dimensions: "Follows the dimensions label in Pricing & dimensions.",
  price: "Follows the price field, plus any options the visitor selects.",
  availability: "Follows the standard availability line for the visitor’s language.",
  customization: "Follows whether the piece is made to request."
};

export default function ProductDetailsEditor({
  productId,
  productKind,
  model,
  dimensions,
  priceEur,
  details,
  onChange
}: ProductDetailsEditorProps) {
  const snapshot = { model, dimensions, priceEur };
  const shown = effectiveProductDetails({ id: productId, productKind, details });
  const onPage = shown.filter((detail) => detail.visible);
  const aside = shown.filter((detail) => !detail.visible);
  const hasInside = shown.some((detail) => detail.id === "inside-material");

  const commit = (next: ProductDetail[]) => {
    onChange(next);
  };

  const draftFromShown = () => cloneProductDetails(shown);

  const patchDetail = (id: string, updater: (detail: ProductDetail) => ProductDetail) => {
    commit(draftFromShown().map((detail) => (detail.id === id ? updater(detail) : detail)));
  };

  return (
    <section className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ivory">Product details</h2>
          <p className="mt-2 max-w-2xl text-xs text-mist">
            These lines appear in the product popup. Add a line, remove it, or set it aside to hide it
            on the site while keeping it here. Put a set-aside line back whenever you want it public again.
            Inside material is filled in only for the original leather models (1–4). Other products do not
            say leather unless you add that line yourself.
          </p>
        </div>
        {details != null ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full border border-ivory/15 px-4 py-2 text-xs text-ivory hover:border-caramel/40"
          >
            Restore automatic lines
          </button>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        {onPage.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ivory/15 px-4 py-5 text-sm text-mist">
            Nothing from this list is on the product page.
          </p>
        ) : (
          onPage.map((detail, index) => (
            <DetailCard
              key={detail.id}
              detail={detail}
              snapshot={snapshot}
              canMoveUp={index > 0}
              canMoveDown={index < onPage.length - 1}
              onPatch={(updater) => patchDetail(detail.id, updater)}
              onMove={(direction) => commit(moveProductDetail(draftFromShown(), detail.id, direction))}
              onAside={() => patchDetail(detail.id, (current) => ({ ...current, visible: false }))}
              onRemove={() => commit(draftFromShown().filter((entry) => entry.id !== detail.id))}
            />
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => commit([...draftFromShown(), createCustomProductDetail()])}
          className="rounded-full border border-caramel/40 px-4 py-2 text-sm text-caramel hover:bg-caramel/10"
        >
          Add detail
        </button>
        {productKind === "handbag" && !hasInside ? (
          <button
            type="button"
            onClick={() => commit([...draftFromShown(), insideMaterialDetail(productId)])}
            className="rounded-full border border-ivory/15 px-4 py-2 text-sm text-ivory hover:border-caramel/40"
          >
            Add inside material
          </button>
        ) : null}
      </div>

      <div className="mt-8 border-t border-ivory/10 pt-5">
        <h3 className="font-serif text-lg text-ivory">Set aside</h3>
        <p className="mt-2 text-xs text-mist">
          Hidden on the product page. You can still edit these lines and put them back.
        </p>
        <div className="mt-4 space-y-3">
          {aside.length === 0 ? (
            <p className="text-sm text-mist">Nothing is set aside.</p>
          ) : (
            aside.map((detail, index) => (
              <DetailCard
                key={detail.id}
                detail={detail}
                snapshot={snapshot}
                aside
                canMoveUp={index > 0}
                canMoveDown={index < aside.length - 1}
                onPatch={(updater) => patchDetail(detail.id, updater)}
                onMove={(direction) => commit(moveProductDetail(draftFromShown(), detail.id, direction))}
                onAside={() => patchDetail(detail.id, (current) => ({ ...current, visible: true }))}
                onRemove={() => commit(draftFromShown().filter((entry) => entry.id !== detail.id))}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function DetailCard({
  detail,
  snapshot,
  aside = false,
  canMoveUp,
  canMoveDown,
  onPatch,
  onMove,
  onAside,
  onRemove
}: {
  detail: ProductDetail;
  snapshot: { model: number | null; dimensions: string; priceEur: number };
  aside?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onPatch: (updater: (detail: ProductDetail) => ProductDetail) => void;
  onMove: (direction: -1 | 1) => void;
  onAside: () => void;
  onRemove: () => void;
}) {
  const enPreview = detail.binding ? boundValuePreview(detail.binding, "en", snapshot) : "";
  const bgPreview = detail.binding ? boundValuePreview(detail.binding, "bg", snapshot) : "";
  const samePreview = enPreview === bgPreview;

  return (
    <article
      className={`rounded-xl border p-4 ${
        aside ? "border-dashed border-ivory/15 bg-black/10" : "border-ivory/10 bg-black/20"
      }`}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-mist">Label · English</span>
          <input
            className="admin-input"
            value={detail.label.en}
            onChange={(event) =>
              onPatch((current) => ({
                ...current,
                label: { ...current.label, en: event.target.value }
              }))
            }
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-mist">Label · Bulgarian</span>
          <input
            className="admin-input"
            value={detail.label.bg}
            onChange={(event) =>
              onPatch((current) => ({
                ...current,
                label: { ...current.label, bg: event.target.value }
              }))
            }
          />
        </label>
        {detail.binding ? (
          <div className="md:col-span-2 rounded-xl border border-ivory/10 bg-[#0b0b0b] px-4 py-3 text-sm text-ivory/90">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">Shown value</p>
            <p className="mt-2">
              {samePreview ? (
                enPreview || "—"
              ) : (
                <>
                  <span className="text-mist">EN</span> {enPreview || "—"}
                  <span className="mx-2 text-ivory/20">·</span>
                  <span className="text-mist">BG</span> {bgPreview || "—"}
                </>
              )}
            </p>
            <p className="mt-2 text-xs text-mist">{BINDING_NOTE[detail.binding]}</p>
            <button
              type="button"
              onClick={() => onPatch((current) => detachProductDetail(current, snapshot))}
              className="mt-3 rounded-full border border-ivory/15 px-3 py-1.5 text-xs text-ivory hover:border-caramel/40"
            >
              Write a fixed value instead
            </button>
          </div>
        ) : (
          <>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-mist">Value · English</span>
              <input
                className="admin-input"
                value={detail.value.en}
                placeholder="Value"
                onChange={(event) =>
                  onPatch((current) => ({
                    ...current,
                    value: { ...current.value, en: event.target.value }
                  }))
                }
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-mist">Value · Bulgarian</span>
              <input
                className="admin-input"
                value={detail.value.bg}
                placeholder="Стойност"
                onChange={(event) =>
                  onPatch((current) => ({
                    ...current,
                    value: { ...current.value, bg: event.target.value }
                  }))
                }
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAside}
          className="rounded-full border border-caramel/40 px-3 py-1.5 text-xs text-caramel hover:bg-caramel/10"
        >
          {aside ? "Put back on the page" : "Set aside"}
        </button>
        <button
          type="button"
          disabled={!canMoveUp}
          onClick={() => onMove(-1)}
          className="rounded-full border border-ivory/15 px-3 py-1.5 text-xs text-mist disabled:opacity-30"
        >
          Move up
        </button>
        <button
          type="button"
          disabled={!canMoveDown}
          onClick={() => onMove(1)}
          className="rounded-full border border-ivory/15 px-3 py-1.5 text-xs text-mist disabled:opacity-30"
        >
          Move down
        </button>
        <button
          type="button"
          onClick={() => {
            const name = detail.label.en.trim() || detail.label.bg.trim() || "this detail";
            if (!window.confirm(`Remove “${name}”? Set aside keeps it in the admin panel instead.`)) return;
            onRemove();
          }}
          className="ml-auto rounded-full bg-red-950/80 px-3 py-1.5 text-xs text-red-200"
        >
          Remove
        </button>
      </div>
    </article>
  );
}
