"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ProductEditor from "@/components/admin/ProductEditor";
import ProductLivePreview from "@/components/admin/ProductLivePreview";
import SectionEditor from "@/components/admin/SectionEditor";
import SectionLivePreview from "@/components/admin/SectionLivePreview";
import { formValuesToPreviewSection, type ContentSectionFormValues } from "@/lib/content/section-schema";
import { SECTION_LAYOUT_LABELS, type ContentSection } from "@/types/content-section";
import type { ProductRecord, ProductRecordInput } from "@/types/product-record";

type StudioTab = "products" | "sections" | "inquiries";

type VisitStats = {
  totalVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
};

const REFRESH_MS = 30_000;

export default function ContentStudio({ storageMode }: { storageMode: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as StudioTab) || "products";
  const selectedId = searchParams.get("id");

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [sectionPreviewValues, setSectionPreviewValues] = useState<ContentSectionFormValues | null>(null);
  const [productPreviewValues, setProductPreviewValues] = useState<ProductRecordInput | null>(null);

  const handleProductPreviewChange = useCallback((product: ProductRecordInput) => {
    setProductPreviewValues(product);
  }, []);

  const handleSectionPreviewChange = useCallback((values: ContentSectionFormValues) => {
    setSectionPreviewValues(values);
  }, []);

  const refresh = useCallback(async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading !== false) setLoading(true);

    try {
      const [productsRes, sectionsRes, statsRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/sections", { cache: "no-store" }),
        fetch("/api/admin/analytics", { cache: "no-store" })
      ]);
      const productsJson = (await productsRes.json()) as { ok: boolean; products?: ProductRecord[] };
      const sectionsJson = (await sectionsRes.json()) as { ok: boolean; sections?: ContentSection[] };
      const statsJson = (await statsRes.json()) as { ok: boolean; stats?: VisitStats };

      if (productsJson.ok && productsJson.products) {
        setProducts(productsJson.products);
      } else if (!productsJson.ok && options?.showLoading !== false) {
        setMessage(
          "Products could not load. Run the products table SQL in Supabase (see supabase/gola-full-setup.sql), then refresh."
        );
      }
      if (sectionsJson.ok && sectionsJson.sections) setSections(sectionsJson.sections);
      if (statsJson.ok && statsJson.stats) setStats(statsJson.stats);
      setLastSyncedAt(new Date());
    } finally {
      if (options?.showLoading !== false) setLoading(false);
    }
  }, []);

  const setTab = useCallback(
    (nextTab: StudioTab, id?: string) => {
      const params = new URLSearchParams();
      params.set("tab", nextTab);
      if (id) params.set("id", id);
      router.push(`/admin/studio?${params.toString()}`);
    },
    [router]
  );

  useEffect(() => {
    void refresh({ showLoading: true });
  }, [refresh]);

  useEffect(() => {
    const sync = () => {
      if (document.visibilityState !== "visible") return;
      void refresh({ showLoading: false });
    };

    const intervalId = window.setInterval(sync, REFRESH_MS);
    document.addEventListener("visibilitychange", sync);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [refresh]);

  useEffect(() => {
    if (loading || selectedId || tab === "inquiries") return;
    const first = tab === "products" ? products[0]?.id : sections[0]?.id;
    if (first) setTab(tab, first);
  }, [loading, selectedId, tab, products, sections, setTab]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId]
  );

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedId) ?? null,
    [sections, selectedId]
  );

  const previewSection = useMemo(() => {
    if (!selectedSection || !sectionPreviewValues) return selectedSection;
    return formValuesToPreviewSection(sectionPreviewValues, selectedSection);
  }, [selectedSection, sectionPreviewValues]);

  const seedDefaultProducts = async (force = false) => {
    setMessage("");
    const response = await fetch("/api/admin/products/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force })
    });
    const result = (await response.json()) as {
      ok: boolean;
      products?: ProductRecord[];
      message?: string;
    };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Unable to load default products.");
      return;
    }
    if (result.products) setProducts(result.products);
    setMessage(result.message || "Default products loaded.");
    const first = result.products?.[0]?.id;
    if (first) setTab("products", first);
  };

  const createProduct = async (kind: "handbag" | "giftBox") => {
    const response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind })
    });
    const result = (await response.json()) as { ok: boolean; product?: ProductRecord; message?: string };
    if (!result.ok || !result.product) {
      setMessage(result.message || "Unable to create product.");
      return;
    }
    await refresh({ showLoading: false });
    setTab("products", result.product.id);
  };

  const createSection = async () => {
    const response = await fetch("/api/admin/sections", { method: "PUT" });
    const result = (await response.json()) as { ok: boolean; section?: ContentSection; message?: string };
    if (!result.ok || !result.section) {
      setMessage(result.message || "Unable to create section.");
      return;
    }
    await refresh({ showLoading: false });
    setTab("sections", result.section.id);
  };

  const deleteSelected = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this item?")) return;

    const endpoint = tab === "products" ? `/api/admin/products/${selectedId}` : `/api/admin/sections/${selectedId}`;
    const response = await fetch(endpoint, { method: "DELETE" });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!result.ok) {
      setMessage(result.message || "Unable to delete.");
      return;
    }
    await refresh({ showLoading: false });
    setTab(tab);
  };

  const listItems =
    tab === "products"
      ? products.map((product) => ({
          id: product.id,
          title: product.name.en || product.name.bg || product.id,
          meta: `${product.productKind} · €${product.priceEur} · ${product.published ? "Live" : "Draft"}`,
          thumb: product.images[0]
        }))
      : sections.map((section) => ({
          id: section.id,
          title: section.title.en || section.title.bg || section.slug,
          meta: `${SECTION_LAYOUT_LABELS[section.layout].label} · order ${section.sortOrder} · ${section.published ? "Live" : "Draft"}`,
          thumb: section.imageUrl
        }));

  return (
    <AdminShell storageMode={storageMode} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-caramel">Content studio</p>
            <h1 className="font-serif text-4xl text-ivory">Edit the live site</h1>
            <p className="mt-2 max-w-2xl text-sm text-mist">
              Pick a product or page section on the left, edit in the center, and see the preview update on the right.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {lastSyncedAt ? (
              <span className="rounded-full border border-ivory/10 px-3 py-1 text-xs text-mist">
                Synced {lastSyncedAt.toLocaleTimeString()}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void refresh({ showLoading: false })}
              className="rounded-full border border-ivory/10 px-3 py-1 text-xs text-mist hover:border-caramel/40 hover:text-ivory"
            >
              Refresh now
            </button>
          {stats ? (
            <>
              <span className="rounded-full border border-ivory/10 px-3 py-1 text-mist">
                Today: <strong className="text-caramel">{stats.visitsToday}</strong>
              </span>
              <span className="rounded-full border border-ivory/10 px-3 py-1 text-mist">
                7 days: <strong className="text-caramel">{stats.visitsLast7Days}</strong>
              </span>
              <Link href="/admin/inquiries" className="rounded-full border border-caramel/40 px-3 py-1 text-caramel">
                Inquiries inbox →
              </Link>
            </>
          ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["products", "Products"],
              ["sections", "Page sections"],
              ["inquiries", "Inquiries"]
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => (key === "inquiries" ? router.push("/admin/inquiries") : setTab(key))}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === key ? "bg-caramel text-ink" : "border border-ivory/15 text-mist hover:text-ivory"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {message ? (
          <p className={`text-sm ${message.includes("Loaded") || message.includes("already") ? "text-caramel" : "text-red-300"}`}>
            {message}
          </p>
        ) : null}

        {tab === "products" && !loading && products.length === 0 ? (
          <div className="rounded-2xl border border-caramel/30 bg-caramel/10 p-5">
            <p className="font-medium text-ivory">No products in the database yet</p>
            <p className="mt-2 text-sm text-mist">
              Load the 4 handbag models and gift box with their default copy and images. This writes directly to your
              Supabase <code className="rounded bg-black/30 px-1">products</code> table.
            </p>
            <button
              type="button"
              onClick={() => void seedDefaultProducts()}
              className="mt-4 rounded-full bg-caramel px-5 py-2.5 text-sm font-medium text-ink"
            >
              Load default products
            </button>
          </div>
        ) : null}

        <div className="grid min-h-[70vh] gap-4 xl:grid-cols-12">
          <aside className="space-y-3 xl:col-span-3">
            <div className="flex flex-wrap gap-2">
              {tab === "products" ? (
                <>
                  <button
                    type="button"
                    onClick={() => void createProduct("handbag")}
                    className="rounded-full bg-caramel px-4 py-2 text-xs font-medium text-ink"
                  >
                    + Handbag
                  </button>
                  <button
                    type="button"
                    onClick={() => void createProduct("giftBox")}
                    className="rounded-full border border-caramel/40 px-4 py-2 text-xs text-caramel"
                  >
                    + Gift box
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void createSection()}
                  className="rounded-full bg-caramel px-4 py-2 text-xs font-medium text-ink"
                >
                  + New section
                </button>
              )}
            </div>

            <div className="max-h-[65vh] space-y-2 overflow-y-auto rounded-2xl border border-ivory/10 bg-[#111] p-2">
              {loading ? <p className="p-3 text-sm text-mist">Loading…</p> : null}
              {listItems.map((item) => {
                const active = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(tab, item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      active ? "bg-caramel/15 ring-1 ring-caramel/40" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ivory/10 bg-black/30">
                      {item.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumb} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-mist">No img</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ivory">{item.title}</p>
                      <p className="truncate text-xs text-mist">{item.meta}</p>
                    </div>
                  </button>
                );
              })}
              {!loading && listItems.length === 0 ? (
                <p className="p-3 text-sm text-mist">Nothing here yet.</p>
              ) : null}
            </div>
          </aside>

          <div className="space-y-3 xl:col-span-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.16em] text-mist">Editor</p>
              {selectedId ? (
                <button
                  type="button"
                  onClick={() => void deleteSelected()}
                  className="text-xs text-red-300 underline"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <div className="max-h-[65vh] overflow-y-auto overscroll-contain rounded-2xl border border-ivory/10 bg-[#0b0b0b] p-4">
              {!selectedId ? (
                <p className="text-sm text-mist">Select an item from the list to start editing.</p>
              ) : null}
              {tab === "products" && selectedProduct ? (
                <ProductEditor
                  key={selectedProduct.id}
                  initialProduct={selectedProduct}
                  onValuesChange={handleProductPreviewChange}
                  onSaved={async (product) => {
                    setProducts((prev) => prev.map((entry) => (entry.id === product.id ? product : entry)));
                  }}
                />
              ) : null}
              {tab === "sections" && selectedSection ? (
                <SectionEditor
                  key={selectedSection.id}
                  initialSection={selectedSection}
                  compact
                  onValuesChange={handleSectionPreviewChange}
                  onSaved={async (section) => {
                    setSections((prev) => prev.map((entry) => (entry.id === section.id ? section : entry)));
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="xl:col-span-4">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-mist">Live preview</p>
            {tab === "products" && (productPreviewValues || selectedProduct) ? (
              <ProductLivePreview product={productPreviewValues ?? selectedProduct!} />
            ) : null}
            {tab === "sections" && previewSection ? <SectionLivePreview section={previewSection} /> : null}
            {!selectedId ? (
              <div className="rounded-2xl border border-dashed border-ivory/15 p-8 text-center text-sm text-mist">
                Preview appears here while you edit.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
