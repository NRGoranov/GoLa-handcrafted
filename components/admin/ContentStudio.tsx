"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import DragSortList, { DragHandle } from "@/components/admin/DragSortList";
import StudioPreviewFrame from "@/components/admin/StudioPreviewFrame";
import BuiltinSectionEditor from "@/components/admin/BuiltinSectionEditor";
import BuiltinSectionLivePreview from "@/components/admin/BuiltinSectionLivePreview";
import ProductEditor from "@/components/admin/ProductEditor";
import ProductLivePreview from "@/components/admin/ProductLivePreview";
import SectionEditor from "@/components/admin/SectionEditor";
import SectionLivePreview from "@/components/admin/SectionLivePreview";
import { BUILTIN_HOMEPAGE_SECTIONS } from "@/lib/content/builtin-sections";
import {
  listCmsPlacementOptions,
  mergeCategoryReorder,
  placementLabel,
  PLACEMENT_FILTER_ALL,
  PLACEMENT_GIFT_BOX,
  PLACEMENT_HAND_BAG,
  productMatchesPlacementFilter,
  type ProductPlacementFilter
} from "@/lib/products/product-placement";
import type { GalleryImageGroup } from "@/lib/galleryTypes";
import {
  formValuesToPreviewSection,
  sectionToFormValues,
  type ContentSectionFormValues
} from "@/lib/content/section-schema";
import {
  builtinSelectionId,
  parseBuiltinSelectionId,
  type BuiltinSectionRecord
} from "@/types/builtin-section";
import { SECTION_LAYOUT_LABELS, type ContentSection } from "@/types/content-section";
import type { ProductRecord, ProductRecordInput } from "@/types/product-record";

type StudioTab = "products" | "sections" | "inquiries";

type VisitStats = {
  totalVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
};

const REFRESH_MS = 30_000;

const PRODUCT_PREVIEW_HEIGHT =
  "max-lg:max-h-[82vh] lg:h-[82vh] lg:max-h-[82vh] lg:sticky lg:top-[22vh] lg:self-start";
const PRODUCT_EDITOR_HEIGHT =
  "max-lg:max-h-[70vh] lg:h-[70vh] lg:max-h-[70vh] lg:sticky lg:top-[25vh] lg:self-start";
const SECTION_PREVIEW_HEIGHT =
  "max-lg:max-h-[60vh] lg:h-[60vh] lg:max-h-[60vh] lg:sticky lg:top-[22vh] lg:self-start";
const SECTION_EDITOR_HEIGHT =
  "max-lg:max-h-[75vh] lg:h-[75vh] lg:max-h-[75vh] lg:sticky lg:top-[22vh] lg:self-start";

function StudioColumn({
  title,
  action,
  children,
  className = "",
  scrollable = false
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}) {
  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-ivory/10 pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-mist">{title}</p>
        {action}
      </div>
      <div
        className={`min-h-0 flex-1 rounded-2xl border border-ivory/10 bg-[#111] transition-[flex] duration-300 ease-in-out ${
          scrollable ? "overflow-y-auto overscroll-contain" : "overflow-hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ContentStudio({ storageMode }: { storageMode: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as StudioTab) || "products";
  const selectedId = searchParams.get("id");

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [builtinSections, setBuiltinSections] = useState<BuiltinSectionRecord[]>([]);
  const [homepageLayout, setHomepageLayout] = useState<string[]>([]);
  const [reordering, setReordering] = useState(false);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [sectionPreviewValues, setSectionPreviewValues] = useState<ContentSectionFormValues | null>(null);
  const [productPreviewValues, setProductPreviewValues] = useState<ProductRecordInput | null>(null);
  const [builtinPreviewValues, setBuiltinPreviewValues] = useState<BuiltinSectionRecord | null>(null);
  const [galleryPreviewGroups, setGalleryPreviewGroups] = useState<GalleryImageGroup[] | null>(null);
  const [galleryPreviewLoading, setGalleryPreviewLoading] = useState(false);
  const [blocksPanelOpen, setBlocksPanelOpen] = useState(true);
  const [productPlacementFilter, setProductPlacementFilter] = useState<ProductPlacementFilter>(
    PLACEMENT_FILTER_ALL
  );

  const refreshGalleryPreview = useCallback(async () => {
    setGalleryPreviewLoading(true);
    try {
      const response = await fetch("/api/admin/gallery?locale=en", { cache: "no-store" });
      const result = (await response.json()) as { ok: boolean; groups?: GalleryImageGroup[] };
      if (result.ok && result.groups) {
        setGalleryPreviewGroups(result.groups);
      }
    } finally {
      setGalleryPreviewLoading(false);
    }
  }, []);

  const handleProductPreviewChange = useCallback((product: ProductRecordInput) => {
    setProductPreviewValues(product);
  }, []);

  const handleSectionPreviewChange = useCallback((values: ContentSectionFormValues) => {
    setSectionPreviewValues(values);
  }, []);

  const handleBuiltinPreviewChange = useCallback((section: BuiltinSectionRecord) => {
    setBuiltinPreviewValues(section);
  }, []);

  const refresh = useCallback(async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading !== false) setLoading(true);

    try {
      const [productsRes, sectionsRes, builtinRes, layoutRes, statsRes, galleryRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/sections", { cache: "no-store" }),
        fetch("/api/admin/builtin-sections", { cache: "no-store" }),
        fetch("/api/admin/homepage-layout", { cache: "no-store" }),
        fetch("/api/admin/analytics", { cache: "no-store" }),
        fetch("/api/admin/gallery?locale=en", { cache: "no-store" })
      ]);
      const productsJson = (await productsRes.json()) as { ok: boolean; products?: ProductRecord[] };
      const sectionsJson = (await sectionsRes.json()) as {
        ok: boolean;
        sections?: ContentSection[];
        message?: string;
      };
      const builtinJson = (await builtinRes.json()) as {
        ok: boolean;
        sections?: BuiltinSectionRecord[];
        message?: string;
      };
      const layoutJson = (await layoutRes.json()) as {
        ok: boolean;
        layout?: { blockOrder: string[] };
        message?: string;
      };
      const statsJson = (await statsRes.json()) as { ok: boolean; stats?: VisitStats };
      const galleryJson = (await galleryRes.json()) as { ok: boolean; groups?: GalleryImageGroup[] };

      if (productsJson.ok && productsJson.products) {
        setProducts(productsJson.products);
      } else if (!productsJson.ok && options?.showLoading !== false) {
        setMessage(
          "Products could not load. Run the products table SQL in Supabase (see supabase/gola-full-setup.sql), then refresh."
        );
      }
      if (sectionsJson.ok && sectionsJson.sections) {
        setSections(sectionsJson.sections);
      } else if (!sectionsJson.ok) {
        setMessage(sectionsJson.message || "Unable to load sections from the database.");
      }
      if (builtinJson.ok && builtinJson.sections) {
        setBuiltinSections(builtinJson.sections);
      }
      if (layoutJson.ok && layoutJson.layout?.blockOrder) {
        setHomepageLayout(layoutJson.layout.blockOrder);
      }
      if (statsJson.ok && statsJson.stats) setStats(statsJson.stats);
      if (galleryJson.ok && galleryJson.groups) setGalleryPreviewGroups(galleryJson.groups);
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
    if (loading || selectedId || tab !== "products") return;
    const first = products[0]?.id;
    if (first) setTab("products", first);
  }, [loading, selectedId, tab, products, setTab]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId]
  );

  const selectedBuiltinKey = useMemo(() => {
    if (tab !== "sections" || !selectedId) return null;
    return parseBuiltinSelectionId(selectedId);
  }, [selectedId, tab]);

  const selectedBuiltinSection = useMemo(() => {
    if (!selectedBuiltinKey) return null;
    return builtinSections.find((section) => section.key === selectedBuiltinKey) ?? null;
  }, [builtinSections, selectedBuiltinKey]);

  const selectedSection = useMemo(() => {
    if (tab !== "sections" || !selectedId || selectedBuiltinKey) return null;
    return sections.find((section) => section.id === selectedId) ?? null;
  }, [sections, selectedId, selectedBuiltinKey, tab]);

  useEffect(() => {
    if (tab !== "sections" || loading || !selectedId || selectedSection || selectedBuiltinSection) return;
    setTab("sections");
  }, [tab, loading, selectedId, selectedSection, selectedBuiltinSection, setTab]);

  const previewSection = useMemo(() => {
    if (!selectedSection || !sectionPreviewValues) return selectedSection;
    return formValuesToPreviewSection(sectionPreviewValues, selectedSection);
  }, [selectedSection, sectionPreviewValues]);

  const previewBuiltinSection = builtinPreviewValues ?? selectedBuiltinSection;

  const isProductDirty = useMemo(() => {
    if (!selectedProduct || !productPreviewValues) return false;
    const { createdAt, updatedAt, ...saved } = selectedProduct;
    void createdAt;
    void updatedAt;
    return JSON.stringify(productPreviewValues) !== JSON.stringify(saved);
  }, [selectedProduct, productPreviewValues]);

  const isBuiltinDirty = useMemo(() => {
    if (!selectedBuiltinSection || !builtinPreviewValues || !selectedBuiltinKey) return false;
    if (builtinPreviewValues.key !== selectedBuiltinKey) return false;
    return (
      JSON.stringify(builtinPreviewValues.contentEn) !== JSON.stringify(selectedBuiltinSection.contentEn) ||
      JSON.stringify(builtinPreviewValues.contentBg) !== JSON.stringify(selectedBuiltinSection.contentBg) ||
      builtinPreviewValues.imageUrl !== selectedBuiltinSection.imageUrl
    );
  }, [selectedBuiltinSection, builtinPreviewValues, selectedBuiltinKey]);

  const isSectionDirty = useMemo(() => {
    if (!selectedSection || !sectionPreviewValues) return false;
    return (
      JSON.stringify(sectionPreviewValues) !== JSON.stringify(sectionToFormValues(selectedSection))
    );
  }, [selectedSection, sectionPreviewValues]);

  useEffect(() => {
    setProductPreviewValues(null);
  }, [selectedProduct?.id]);

  useEffect(() => {
    setBuiltinPreviewValues(null);
  }, [selectedBuiltinKey]);

  useEffect(() => {
    setSectionPreviewValues(null);
  }, [selectedSection?.id]);

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

  const createProduct = async (kind: "handbag" | "giftBox", categorySlug: string | null = null) => {
    const response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, categorySlug })
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
    if (tab === "sections" && !selectedSection) {
      setMessage("Built-in blocks cannot be deleted. Select a custom CMS block.");
      return;
    }
    if (tab === "products" && !selectedProduct) return;
    await deleteItem(tab, selectedId);
  };

  const deleteItem = async (itemTab: StudioTab, id: string) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;

    setMessage("");
    const endpoint =
      itemTab === "products" ? `/api/admin/products/${id}` : `/api/admin/sections/${id}`;
    const response = await fetch(endpoint, { method: "DELETE" });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Unable to delete.");
      return;
    }
    await refresh({ showLoading: false });
    setTab(itemTab);
    setMessage(itemTab === "products" ? "Product deleted." : "Section deleted.");
  };

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    [products]
  );

  const cmsSectionFilters = useMemo(
    () =>
      listCmsPlacementOptions(sections)
        .filter((option) => !option.disabled)
        .map((option) => ({ value: option.value, label: option.label })),
    [sections]
  );

  const filteredProducts = useMemo(() => {
    if (productPlacementFilter === PLACEMENT_FILTER_ALL) return sortedProducts;
    return sortedProducts.filter((product) => productMatchesPlacementFilter(product, productPlacementFilter));
  }, [productPlacementFilter, sortedProducts]);

  const productPlacementFilters = useMemo(
    () => [
      { value: PLACEMENT_FILTER_ALL, label: "All" },
      { value: PLACEMENT_HAND_BAG, label: "Handbag" },
      { value: PLACEMENT_GIFT_BOX, label: "Gift" },
      ...cmsSectionFilters
    ],
    [cmsSectionFilters]
  );

  const sectionMap = useMemo(() => new Map(sections.map((section) => [section.id, section])), [sections]);

  const builtinMap = useMemo(
    () => new Map(BUILTIN_HOMEPAGE_SECTIONS.map((section) => [builtinSelectionId(section.key), section])),
    []
  );

  const layoutItems = useMemo(
    () =>
      homepageLayout
        .map((blockId) => {
          const builtin = builtinMap.get(blockId);
          if (builtin) return { id: blockId, kind: "builtin" as const, builtin };
          const section = sectionMap.get(blockId);
          if (section) return { id: blockId, kind: "cms" as const, section };
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [homepageLayout, builtinMap, sectionMap]
  );

  const livePageBlockCount = layoutItems.length;

  const reorderProducts = async (orderedIds: string[]) => {
    const previous = sortedProducts;
    const mergedIds =
      productPlacementFilter === PLACEMENT_FILTER_ALL
        ? orderedIds
        : mergeCategoryReorder(
            previous,
            new Set(filteredProducts.map((product) => product.id)),
            orderedIds
          );

    const nextProducts = mergedIds
      .map((id, index) => {
        const product = previous.find((entry) => entry.id === id);
        return product ? { ...product, sortOrder: index } : null;
      })
      .filter((product): product is ProductRecord => product !== null);

    setProducts(nextProducts);
    setReordering(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/products/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: mergedIds })
      });
      const result = (await response.json()) as { ok: boolean; products?: ProductRecord[]; message?: string };
      if (!response.ok || !result.ok || !result.products) {
        throw new Error(result.message || "Unable to reorder products.");
      }
      setProducts(result.products);
      setMessage("Product order saved.");
    } catch (error) {
      setProducts(previous);
      setMessage(error instanceof Error ? error.message : "Unable to reorder products.");
    } finally {
      setReordering(false);
    }
  };

  const reorderHomepageLayout = async (orderedIds: string[]) => {
    const previous = homepageLayout;
    setHomepageLayout(orderedIds);
    setReordering(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/homepage-layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockOrder: orderedIds })
      });
      const result = (await response.json()) as {
        ok: boolean;
        layout?: { blockOrder: string[] };
        message?: string;
      };
      if (!response.ok || !result.ok || !result.layout?.blockOrder) {
        throw new Error(result.message || "Unable to reorder homepage sections.");
      }
      setHomepageLayout(result.layout.blockOrder);
      await refresh({ showLoading: false });
      setMessage("Homepage order saved.");
    } catch (error) {
      setHomepageLayout(previous);
      setMessage(error instanceof Error ? error.message : "Unable to reorder homepage sections.");
    } finally {
      setReordering(false);
    }
  };

  const editorActions = (
    <div className="flex items-center gap-3">
      {tab === "sections" && (selectedSection || selectedBuiltinSection) ? (
        <button type="button" onClick={() => setTab("sections")} className="text-[10px] text-caramel underline">
          ← Page layout
        </button>
      ) : null}
      {(tab === "products" && selectedProduct) || (tab === "sections" && selectedSection) ? (
        <button type="button" onClick={() => void deleteSelected()} className="text-[10px] text-red-300 underline">
          Delete
        </button>
      ) : null}
    </div>
  );

  const editorBody = (
    <div className={`bg-[#0b0b0b] p-4 ${tab === "products" ? "min-h-full" : "h-full overflow-y-auto overscroll-contain"}`}>
      {tab === "sections" && !selectedSection && !selectedBuiltinSection && !loading ? (
        <div className="rounded-xl border border-ivory/10 bg-[#111] p-6">
          <h2 className="font-serif text-xl text-ivory">Select a section to edit</h2>
          <p className="mt-2 text-sm text-mist">
            The left column shows the full live homepage order. Click any built-in block (Hero, Collection, Gallery,
            etc.) or a custom CMS block to edit its copy here. Handbag and gift box product cards are under{" "}
            <button type="button" onClick={() => setTab("products")} className="text-caramel underline">
              Products
            </button>
            .
          </p>
        </div>
      ) : null}
      {tab === "products" && !selectedProduct ? (
        <p className="text-sm text-mist">Select a product from the library to edit.</p>
      ) : null}
      {tab === "products" && selectedProduct ? (
        <ProductEditor
          key={selectedProduct.id}
          initialProduct={selectedProduct}
          cmsSections={sections}
          onValuesChange={handleProductPreviewChange}
          onSaved={async (product) => {
            setProducts((prev) => prev.map((entry) => (entry.id === product.id ? product : entry)));
            setProductPreviewValues(product);
          }}
        />
      ) : null}
      {tab === "sections" && selectedBuiltinKey && selectedBuiltinSection ? (
        <BuiltinSectionEditor
          key={selectedBuiltinKey}
          sectionKey={selectedBuiltinKey}
          initialSection={selectedBuiltinSection}
          onValuesChange={handleBuiltinPreviewChange}
          onGalleryUpdated={() => void refreshGalleryPreview()}
          onSaved={(section) => {
            setBuiltinSections((prev) => prev.map((entry) => (entry.key === section.key ? section : entry)));
            setBuiltinPreviewValues(section);
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
            setSectionPreviewValues(sectionToFormValues(section));
          }}
        />
      ) : null}
    </div>
  );

  const productPreviewBody =
    productPreviewValues || selectedProduct ? (
      <StudioPreviewFrame
        variant="card"
        label={
          (productPreviewValues ?? selectedProduct)!.name.en ||
          (productPreviewValues ?? selectedProduct)!.name.bg ||
          "Product card"
        }
        isDraft={isProductDirty}
      >
        <ProductLivePreview product={productPreviewValues ?? selectedProduct!} />
      </StudioPreviewFrame>
    ) : (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-mist">
        Select a product to preview its catalog card.
      </div>
    );

  const sectionPreviewBody = (
    <div className="flex h-full min-h-0 w-full flex-col bg-ink p-1">
      {tab === "sections" && previewBuiltinSection && selectedBuiltinKey ? (
        <StudioPreviewFrame
          expanded
          screenSized
          interactive={selectedBuiltinKey === "gallery"}
          label={
            BUILTIN_HOMEPAGE_SECTIONS.find((section) => section.key === selectedBuiltinKey)?.title ??
            "Built-in section"
          }
          isDraft={isBuiltinDirty}
        >
          <BuiltinSectionLivePreview
            sectionKey={selectedBuiltinKey}
            content={previewBuiltinSection.contentEn}
            imageUrl={previewBuiltinSection.imageUrl}
            galleryGroups={selectedBuiltinKey === "gallery" ? galleryPreviewGroups : undefined}
            galleryLoading={selectedBuiltinKey === "gallery" ? galleryPreviewLoading : false}
            interactiveGallery={selectedBuiltinKey === "gallery"}
          />
        </StudioPreviewFrame>
      ) : null}
      {tab === "sections" && previewSection ? (
        <StudioPreviewFrame
          expanded
          screenSized
          label={previewSection.title.en || previewSection.title.bg || previewSection.slug}
          isDraft={isSectionDirty}
        >
          <SectionLivePreview section={previewSection} />
        </StudioPreviewFrame>
      ) : null}
      {tab === "sections" && !selectedSection && !selectedBuiltinSection ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-ivory/15 p-6 text-center text-sm text-mist">
          Select a section from the layout list to preview it here.
        </div>
      ) : null}
    </div>
  );

  return (
    <AdminShell storageMode={storageMode} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-caramel">Content studio</p>
            <h1 className="font-serif text-4xl text-ivory">Edit the live site</h1>
            <p className="mt-2 max-w-2xl text-sm text-mist">
              Pick an item on the left, drag to reorder, edit in the center, and see the preview update on the right.
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
              onClick={() => {
                if (key === "inquiries") {
                  router.push("/admin/inquiries");
                  return;
                }
                setTab(key);
              }}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === key ? "bg-caramel text-ink" : "border border-ivory/15 text-mist hover:text-ivory"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {storageMode === "read-only" ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-950/30 p-4">
            <p className="font-medium text-red-100">Changes cannot be saved (read-only storage)</p>
            <p className="mt-2 text-sm text-red-200/90">
              Connect Supabase in production (<code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and <code className="rounded bg-black/30 px-1">SUPABASE_SERVICE_ROLE_KEY</code>). Until then, edits only
              appear in the preview and are not written to the database.
            </p>
          </div>
        ) : null}

        {message ? (
          <p
            className={`text-sm ${
              message.includes("Loaded") ||
              message.includes("already") ||
              message.includes("saved") ||
              message.includes("Saved")
                ? "text-caramel"
                : "text-red-300"
            }`}
          >
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

        <div className="flex min-h-0 flex-col gap-4 lg:flex-row lg:items-start">
          <aside
            className={`flex shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out max-lg:w-full max-lg:max-h-[38vh] ${
              blocksPanelOpen ? "w-full lg:w-[min(17rem,20%)]" : "hidden w-11 lg:flex"
            } lg:sticky lg:top-[25vh] lg:h-[70vh] lg:max-h-[70vh] lg:self-start`}
          >
            {blocksPanelOpen ? (
            <StudioColumn
              className="flex h-full min-h-0 w-full flex-col"
              title={
                tab === "products"
                  ? `Products (${products.length})`
                  : `Live page (${livePageBlockCount} blocks)`
              }
              action={
                <div className="flex items-center gap-2">
                  {tab === "products" ? (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (productPlacementFilter === PLACEMENT_GIFT_BOX) {
                            void createProduct("giftBox");
                            return;
                          }
                          const categorySlug =
                            productPlacementFilter !== PLACEMENT_FILTER_ALL &&
                            productPlacementFilter !== PLACEMENT_HAND_BAG &&
                            productPlacementFilter !== PLACEMENT_GIFT_BOX
                              ? productPlacementFilter
                              : null;
                          void createProduct("handbag", categorySlug);
                        }}
                        className="rounded-full bg-caramel px-3 py-1 text-[10px] font-medium text-ink"
                        title="Add product in the active category"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void createSection()}
                      className="rounded-full bg-caramel px-3 py-1 text-[10px] font-medium text-ink"
                    >
                      + New
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setBlocksPanelOpen(false)}
                    className="hidden rounded-full border border-ivory/15 px-2 py-1 text-[10px] text-mist transition-colors duration-200 hover:border-caramel/40 hover:text-ivory lg:inline-flex"
                    title="Hide blocks list"
                    aria-label="Hide blocks list"
                  >
                    ◀
                  </button>
                </div>
              }
            >
            <div className="h-full min-h-0 overflow-y-auto overscroll-contain p-2">
              {loading ? <p className="p-3 text-sm text-mist">Loading…</p> : null}

              {tab === "products" && sortedProducts.length > 0 ? (
                <>
                  <div className="mb-3 flex flex-wrap gap-1.5 px-1">
                    {productPlacementFilters.map((filter) => {
                      const active = productPlacementFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setProductPlacementFilter(filter.value)}
                          className={`rounded-full px-3 py-1 text-[10px] transition ${
                            active
                              ? "bg-caramel text-ink"
                              : "border border-ivory/15 text-mist hover:border-caramel/40 hover:text-ivory"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.14em] text-mist">
                    Drag to reorder {productPlacementFilter === PLACEMENT_FILTER_ALL ? "catalog cards" : "products in this section"}
                  </p>
                  <DragSortList
                    items={filteredProducts}
                    disabled={reordering}
                    onReorder={reorderProducts}
                    renderItem={(product, index, { dragHandleProps, isDragging }) => {
                      const active = product.id === selectedId;
                      return (
                        <div
                          className={`flex items-center gap-2 rounded-xl p-3 transition ${
                            active ? "bg-caramel/15 ring-1 ring-caramel/40" : "hover:bg-white/5"
                          } ${isDragging ? "bg-[#151515]" : ""}`}
                        >
                          <DragHandle dragHandleProps={dragHandleProps} />
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ivory/15 text-[11px] text-mist">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTab("products", product.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-ivory/10 bg-black/30">
                              {product.images[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-mist">—</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-ivory">
                                {product.name.en || product.name.bg || product.id}
                              </p>
                              <p className="truncate text-xs text-mist">
                                {placementLabel(product, sections)} · €{product.priceEur}
                              </p>
                            </div>
                          </button>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                              product.published
                                ? "bg-caramel/20 text-caramel"
                                : "border border-ivory/15 text-mist"
                            }`}
                          >
                            {product.published ? "Live" : "Draft"}
                          </span>
                        </div>
                      );
                    }}
                  />
                </>
              ) : null}

              {tab === "sections" && !loading ? (
                <div className="space-y-3">
                  <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-mist">
                    Drag to reorder homepage blocks
                  </p>
                  {layoutItems.length > 0 ? (
                    <DragSortList
                      items={layoutItems}
                      disabled={reordering}
                      onReorder={reorderHomepageLayout}
                      renderItem={(item, index, { dragHandleProps, isDragging }) => {
                        const active = selectedId === item.id;
                        if (item.kind === "builtin") {
                          const section = item.builtin;
                          return (
                            <div
                              className={`flex items-start gap-2 rounded-xl border p-3 transition ${
                                active
                                  ? "border-caramel bg-caramel/10 ring-1 ring-caramel/40"
                                  : "border-ivory/10 bg-[#0d0d0d] hover:border-caramel/30"
                              } ${isDragging ? "bg-[#151515]" : ""}`}
                            >
                              <DragHandle dragHandleProps={dragHandleProps} className="mt-0.5" />
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ivory/15 text-[11px] text-mist">
                                {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => setTab("sections", item.id)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <p className="text-sm font-medium text-ivory">{section.title}</p>
                                <p className="mt-0.5 text-xs text-mist">
                                  #{section.anchor} · {section.description}
                                </p>
                                {section.productCards ? (
                                  <p className="mt-2 text-[10px] text-mist/80">+ product cards (Products tab)</p>
                                ) : null}
                              </button>
                              <span className="shrink-0 rounded-full bg-caramel/15 px-2 py-0.5 text-[10px] text-caramel">
                                Built-in
                              </span>
                            </div>
                          );
                        }

                        const section = item.section;
                        return (
                          <div
                            className={`flex items-start gap-2 rounded-xl border p-3 transition ${
                              active
                                ? "border-caramel bg-caramel/10 ring-1 ring-caramel/40"
                                : "border-ivory/10 bg-[#151515] hover:border-caramel/30"
                            } ${isDragging ? "bg-[#1a1a1a]" : ""}`}
                          >
                            <DragHandle dragHandleProps={dragHandleProps} className="mt-0.5" />
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-caramel/30 text-[11px] text-caramel">
                              {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTab("sections", section.id)}
                              className="flex min-w-0 flex-1 items-start gap-2 text-left"
                            >
                              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-ivory/10 bg-black/30">
                                {section.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={section.imageUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[9px] text-mist">—</div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-ivory">
                                  {section.title.en || section.title.bg || section.slug}
                                </p>
                                <p className="mt-0.5 text-xs text-mist">
                                  {SECTION_LAYOUT_LABELS[section.layout].label} · #{section.slug}
                                </p>
                              </div>
                            </button>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                                section.published
                                  ? "bg-caramel/20 text-caramel"
                                  : "border border-ivory/15 text-mist"
                              }`}
                            >
                              {section.published ? "Live" : "Draft"}
                            </span>
                            <button
                              type="button"
                              onClick={() => void deleteItem("sections", section.id)}
                              className="shrink-0 rounded-full border border-red-400/30 px-2 py-0.5 text-[10px] text-red-200 hover:bg-red-950/40"
                              title="Delete section"
                            >
                              Delete
                            </button>
                          </div>
                        );
                      }}
                    />
                  ) : (
                    <p className="p-3 text-sm text-mist">Loading homepage layout…</p>
                  )}
                  {!layoutItems.some((item) => item.kind === "cms") ? (
                    <div className="rounded-xl border border-dashed border-ivory/15 bg-[#0d0d0d] p-4 text-center">
                      <p className="text-xs text-mist">No custom CMS blocks yet.</p>
                      <button
                        type="button"
                        onClick={() => void createSection()}
                        className="mt-3 rounded-full bg-caramel px-4 py-1.5 text-xs font-medium text-ink"
                      >
                        Add custom block
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!loading && tab === "products" && sortedProducts.length === 0 ? (
                <p className="p-4 text-center text-sm text-mist">Nothing here yet.</p>
              ) : null}
            </div>
          </StudioColumn>
            ) : (
              <button
                type="button"
                onClick={() => setBlocksPanelOpen(true)}
                className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-ivory/10 bg-[#111] px-1 py-6 text-mist transition-colors duration-200 hover:border-caramel/30 hover:text-ivory lg:h-[70vh] lg:max-h-[70vh]"
                title="Show blocks list"
                aria-label="Show blocks list"
              >
                <span className="text-sm">▶</span>
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.2em]"
                  style={{ writingMode: "vertical-rl" }}
                >
                  Blocks
                </span>
              </button>
            )}
          </aside>

          {tab === "sections" ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-start">
              <StudioColumn
                className={`min-h-0 min-w-0 flex-1 lg:max-w-[min(52rem,58%)] ${SECTION_EDITOR_HEIGHT}`}
                title="Editor"
                action={editorActions}
                scrollable
              >
                {editorBody}
              </StudioColumn>
              <StudioColumn
                className={`min-h-0 min-w-0 flex-1 ${SECTION_PREVIEW_HEIGHT}`}
                title="Live preview"
                scrollable
              >
                {sectionPreviewBody}
              </StudioColumn>
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
              <StudioColumn
                className={`h-full w-full shrink-0 sm:w-auto sm:max-w-sm ${PRODUCT_PREVIEW_HEIGHT}`}
                title="Live preview"
                scrollable
              >
                <div className="flex min-h-full items-start justify-center bg-ink p-2 pb-3">
                  {productPreviewBody}
                </div>
              </StudioColumn>
              <StudioColumn
                className={`h-full min-h-0 min-w-0 flex-1 ${PRODUCT_EDITOR_HEIGHT}`}
                title="Editor"
                action={editorActions}
                scrollable
              >
                {editorBody}
              </StudioColumn>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
