"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import AdminImage from "@/components/admin/AdminImage";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PublishField from "@/components/admin/PublishField";
import PublishActionsFooter from "@/components/admin/PublishActionsFooter";
import ProductCustomizationEditor from "@/components/admin/ProductCustomizationEditor";
import {
  publishIssueFieldIds,
  scrollToPublishField,
  validateProductForPublish,
  type PublishIssue
} from "@/lib/admin/publish-validation";
import type { AdminEditorSaveHandle } from "@/types/admin-editor-save";
import type { ProductRecord, ProductRecordInput } from "@/types/product-record";
import type { ContentSection } from "@/types/content-section";
import {
  applyProductPlacement,
  listCmsPlacementOptions,
  mergeContentSections,
  normalizeProductRecordInput,
  placementLabel,
  productPlacementValue,
  PLACEMENT_GIFT_BOX,
  PLACEMENT_HAND_BAG
} from "@/lib/products/product-placement";
import { mergeCustomizationOptions } from "@/lib/products/customization-options";

type ProductEditorProps = {
  initialProduct: ProductRecord;
  cmsSections: ContentSection[];
  onSaved?: (product: ProductRecord) => void;
  onValuesChange?: (product: ProductRecordInput) => void;
};

function localizedField(
  product: ProductRecordInput,
  field: "name" | "description" | "cardSummary",
  locale: "en" | "bg",
  value: string
): ProductRecordInput {
  return {
    ...product,
    [field]: { ...product[field], [locale]: value }
  };
}

export default forwardRef<AdminEditorSaveHandle, ProductEditorProps>(function ProductEditor(
  {
  initialProduct,
  cmsSections,
  onSaved,
  onValuesChange
}: ProductEditorProps,
  ref
) {
  const [values, setValues] = useState<ProductRecordInput>(() =>
    normalizeProductRecordInput(initialProduct)
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [publishIssues, setPublishIssues] = useState<PublishIssue[]>([]);
  const [fetchedSections, setFetchedSections] = useState<ContentSection[]>([]);
  const [sectionsLoadError, setSectionsLoadError] = useState("");
  const lastSyncedAtRef = useRef(initialProduct.updatedAt);
  const invalidFields = useMemo(() => publishIssueFieldIds(publishIssues), [publishIssues]);
  const allSections = useMemo(
    () => mergeContentSections(cmsSections, fetchedSections),
    [cmsSections, fetchedSections]
  );
  const placementValue = useMemo(() => productPlacementValue(values), [values]);
  const placementOptions = useMemo(() => {
    const cmsOptions = listCmsPlacementOptions(allSections);
    return [
      { value: PLACEMENT_HAND_BAG, label: "Handbag (main collection)" },
      { value: PLACEMENT_GIFT_BOX, label: "Gift box" },
      ...cmsOptions
    ];
  }, [allSections]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/admin/sections", { cache: "no-store" });
        const result = (await response.json()) as {
          ok: boolean;
          sections?: ContentSection[];
          message?: string;
        };
        if (cancelled) return;
        if (!response.ok || !result.ok || !Array.isArray(result.sections)) {
          setSectionsLoadError(result.message || "Unable to load page sections.");
          return;
        }
        setFetchedSections(result.sections);
        setSectionsLoadError("");
      } catch {
        if (!cancelled) setSectionsLoadError("Unable to load page sections.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    lastSyncedAtRef.current = initialProduct.updatedAt;
    setValues(normalizeProductRecordInput(initialProduct));
    setPublishIssues([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching products
  }, [initialProduct.id]);

  useEffect(() => {
    if (status === "saving") return;
    if (Date.parse(initialProduct.updatedAt) <= Date.parse(lastSyncedAtRef.current)) return;
    lastSyncedAtRef.current = initialProduct.updatedAt;
    setValues(normalizeProductRecordInput(initialProduct));
  }, [initialProduct, status]);

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  useEffect(() => {
    if (publishIssues.length === 0) return;
    setPublishIssues(validateProductForPublish(values));
  }, [values, publishIssues.length]);

  const trySetPublished = (nextPublished: boolean) => {
    if (!nextPublished) {
      setPublishIssues([]);
      patch((prev) => ({ ...prev, published: false }));
      return;
    }

    const issues = validateProductForPublish(values);
    if (issues.length > 0) {
      setPublishIssues(issues);
      setStatus("error");
      setMessage("Complete the highlighted fields to publish.");
      scrollToPublishField(issues[0].fieldId);
      return;
    }

    setPublishIssues([]);
    patch((prev) => ({ ...prev, published: true }));
  };

  const patch = (updater: (prev: ProductRecordInput) => ProductRecordInput) => {
    setValues((prev) => updater(prev));
  };

  const onUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
    if (!response.ok || !result.ok || !result.url) {
      throw new Error(result.message || "Upload failed.");
    }
    patch((prev) => ({ ...prev, images: [...prev.images, result.url!] }));
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    patch((prev) => ({ ...prev, images: [...prev.images, url] }));
    setImageUrlInput("");
  };

  const setCoverImage = (index: number) => {
    if (index <= 0) return;
    patch((prev) => {
      const images = [...prev.images];
      const [cover] = images.splice(index, 1);
      images.unshift(cover);
      return { ...prev, images };
    });
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    patch((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.images.length) return prev;
      const images = [...prev.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...prev, images };
    });
  };

  const performSave = useCallback(
    async (published: boolean): Promise<boolean> => {
      setMessage("");
      const payload: ProductRecordInput = { ...values, published };

      if (published) {
        const issues = validateProductForPublish(payload);
        if (issues.length > 0) {
          setStatus("error");
          setPublishIssues(issues);
          setMessage("Complete the highlighted fields to publish.");
          scrollToPublishField(issues[0].fieldId);
          return false;
        }
      }

      setStatus("saving");
      const customizationOptions = mergeCustomizationOptions(
        values.customizationOptions,
        values.productKind,
        values.productKind === "handbag" ? payload.engravingAddOnEur ?? 20 : null
      ).map((option) => {
        if (option.id !== "customEngraving") return option;
        if (values.productKind === "handbag") {
          return { ...option, addOnEur: payload.engravingAddOnEur ?? 20 };
        }
        return option;
      });
      const payloadWithOptions: ProductRecordInput = { ...payload, customizationOptions };
      setValues(payloadWithOptions);

      try {
        const response = await fetch(`/api/admin/products/${initialProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadWithOptions)
        });
        const result = (await response.json()) as {
          ok: boolean;
          product?: ProductRecord;
          message?: string;
          issues?: PublishIssue[];
        };
        if (!response.ok || !result.ok || !result.product) {
          if (result.issues?.length) {
            setPublishIssues(result.issues);
            scrollToPublishField(result.issues[0].fieldId);
          }
          throw new Error(result.message || "Unable to save product.");
        }
        setStatus("success");
        setPublishIssues([]);
        setMessage(
          published
            ? "Product published — visible on the live site."
            : "Draft saved — check Published on site to make it visible to visitors."
        );
        lastSyncedAtRef.current = result.product.updatedAt;
        setValues(normalizeProductRecordInput(result.product));
        onSaved?.(result.product);
        return true;
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Unable to save product.");
        return false;
      }
    },
    [initialProduct.id, onSaved, values]
  );

  useImperativeHandle(ref, () => ({ save: performSave }), [performSave]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await performSave(values.published);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
        <h2 className="font-serif text-xl text-ivory">Product settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-mist">ID / slug</span>
            <input className="admin-input" value={values.id} readOnly />
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-mist">Sort order</span>
            <input
              className="admin-input"
              type="number"
              min={0}
              value={values.sortOrder}
              onChange={(e) => patch((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))}
            />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-mist">Type / section</span>
            <select
              className="admin-input"
              value={placementValue}
              onChange={(e) => patch((prev) => applyProductPlacement(prev, e.target.value))}
            >
              {placementOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="bg-ink"
                >
                  {option.label}
                </option>
              ))}
              {!placementOptions.some((option) => option.value === placementValue) && placementValue ? (
                <option value={placementValue} className="bg-ink">
                  Missing section: {placementValue}
                </option>
              ) : null}
            </select>
            <p className="text-xs text-mist">
              Choose where this product appears. CMS sections (e.g. earrings) need layout “Product grid” under Page
              sections. Loaded {allSections.length} page section{allSections.length === 1 ? "" : "s"}. Current:{" "}
              {placementLabel(values, allSections)}.
            </p>
            {sectionsLoadError ? <p className="text-xs text-red-300/90">{sectionsLoadError}</p> : null}
            {allSections.length === 0 && !sectionsLoadError ? (
              <p className="text-xs text-amber-200/90">
                No page sections found yet. Create one under the Page sections tab, then refresh.
              </p>
            ) : null}
          </label>
        </div>
      </section>

      {(["en", "bg"] as const).map((locale) => (
        <section key={locale} className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-caramel">
            {locale === "en" ? "English" : "Bulgarian"}
          </p>
          <div className="mt-4 space-y-3">
            <PublishField
              fieldId={`field-product-name-${locale}`}
              label="Name"
              invalid={invalidFields.has(`field-product-name-${locale}`)}
              hint={publishIssues.find((issue) => issue.fieldId === `field-product-name-${locale}`)?.message}
            >
              <input
                className="admin-input"
                placeholder="Name"
                value={values.name[locale]}
                onChange={(e) => patch((prev) => localizedField(prev, "name", locale, e.target.value))}
              />
            </PublishField>
            <PublishField
              fieldId={`field-product-summary-${locale}`}
              label="Card summary"
              invalid={invalidFields.has(`field-product-summary-${locale}`)}
              hint={publishIssues.find((issue) => issue.fieldId === `field-product-summary-${locale}`)?.message}
            >
              <textarea
                className="admin-input min-h-20"
                placeholder="Card summary"
                value={values.cardSummary[locale]}
                onChange={(e) => patch((prev) => localizedField(prev, "cardSummary", locale, e.target.value))}
              />
            </PublishField>
            <PublishField label="Full description">
              <textarea
                className="admin-input min-h-28"
                placeholder="Full description"
                value={values.description[locale]}
                onChange={(e) => patch((prev) => localizedField(prev, "description", locale, e.target.value))}
              />
            </PublishField>
          </div>
        </section>
      ))}

      <ProductCustomizationEditor
        productId={values.id}
        syncKey={initialProduct.updatedAt}
        productKind={values.productKind}
        engravingAddOnEur={values.engravingAddOnEur}
        offerGiftBoxUpsell={values.productKind === "handbag" ? values.offerGiftBoxUpsell : false}
        onOfferGiftBoxUpsellChange={
          values.productKind === "handbag"
            ? (offerGiftBoxUpsell) => patch((prev) => ({ ...prev, offerGiftBoxUpsell }))
            : undefined
        }
        options={values.customizationOptions}
        onChange={(customizationOptions) =>
          patch((prev) => {
            const engravingOption = customizationOptions.find((option) => option.id === "customEngraving");
            return {
              ...prev,
              customizationOptions,
              engravingAddOnEur:
                prev.productKind === "handbag" && engravingOption && "addOnEur" in engravingOption
                  ? engravingOption.addOnEur ?? prev.engravingAddOnEur ?? 20
                  : prev.engravingAddOnEur
            };
          })
        }
      />

      <section className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
        <h2 className="font-serif text-xl text-ivory">Pricing & dimensions</h2>
        {values.productKind === "handbag" ? (
          <p className="mt-2 text-xs text-mist">
            Engraving add-on price is also used for the preset &quot;Custom engraving&quot; checkbox when enabled
            above.
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <PublishField
            fieldId="field-product-price"
            label="Price (EUR)"
            invalid={invalidFields.has("field-product-price")}
            hint={publishIssues.find((issue) => issue.fieldId === "field-product-price")?.message}
          >
            <input
              className="admin-input"
              placeholder="Price (EUR)"
              type="number"
              min={0}
              value={values.priceEur}
              onChange={(e) => patch((prev) => ({ ...prev, priceEur: Number(e.target.value) || 0 }))}
            />
          </PublishField>
          <input
            className="admin-input"
            placeholder="Dimensions label"
            value={values.dimensions}
            onChange={(e) => patch((prev) => ({ ...prev, dimensions: e.target.value }))}
          />
          {values.productKind === "handbag" ? (
            <input
              className="admin-input"
              type="number"
              placeholder="Engraving add-on EUR"
              value={values.engravingAddOnEur ?? 20}
              onChange={(e) => {
                const engravingAddOnEur = Number(e.target.value) || 0;
                patch((prev) => {
                  const customizationOptions = mergeCustomizationOptions(
                    prev.customizationOptions,
                    prev.productKind,
                    engravingAddOnEur
                  ).map((option) =>
                    option.id === "customEngraving" ? { ...option, addOnEur: engravingAddOnEur } : option
                  );
                  return { ...prev, engravingAddOnEur, customizationOptions };
                });
              }}
            />
          ) : null}
        </div>
      </section>

      <section
        id="field-product-images"
        className={`scroll-mt-24 rounded-2xl border bg-[#111] p-5 ${
          invalidFields.has("field-product-images") ? "border-red-400/50 ring-1 ring-red-400/40" : "border-ivory/10"
        }`}
      >
        <h2 className="font-serif text-xl text-ivory">Images · required</h2>
        {invalidFields.has("field-product-images") ? (
          <p className="mt-1 text-xs text-red-200/90">
            {publishIssues.find((issue) => issue.fieldId === "field-product-images")?.message}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-mist">
          The cover image is the homepage card thumbnail. Use Set cover, then Save product.
        </p>

        <div className="mt-4 space-y-3">
          <ImageUploadField
            label="Upload product photo"
            hint="Choose a file — it appears in the gallery below without scrolling the editor."
            onUpload={onUpload}
          />
          <div className="flex flex-wrap gap-2">
            <input
              className="admin-input min-w-[12rem] flex-1"
              placeholder="Or paste image URL /site/path"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-full border border-ivory/15 px-4 py-2 text-sm text-ivory hover:border-caramel/40"
            >
              Add URL
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-ivory/10 bg-black/20">
          <p className="border-b border-ivory/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-mist">
            Gallery · {values.images.length} image{values.images.length === 1 ? "" : "s"}
          </p>
          <div className="max-h-[min(52vh,520px)] overflow-y-auto overscroll-contain p-3">
            {values.images.length === 0 ? (
              <p className="rounded-xl border border-dashed border-ivory/15 p-6 text-center text-sm text-mist">
                No images yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {values.images.map((src, index) => {
                  if (!src?.trim()) return null;
                  return (
                  <div
                    key={`${src}-${index}`}
                    className={`relative overflow-hidden rounded-xl border bg-black/20 ${
                      index === 0 ? "border-caramel ring-1 ring-caramel/50" : "border-ivory/10"
                    }`}
                  >
                    <div className="relative aspect-[3/4]">
                      <AdminImage src={src} alt="" fill className="object-cover" sizes="160px" />
                    </div>
                    <div className="flex flex-wrap gap-1 border-t border-ivory/10 bg-[#0a0a0a] p-2">
                      {index === 0 ? (
                        <span className="rounded-full bg-caramel px-2 py-0.5 text-[10px] font-medium text-ink">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCoverImage(index)}
                          className="rounded-full border border-caramel/40 px-2 py-0.5 text-[10px] text-caramel hover:bg-caramel/10"
                        >
                          Set cover
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveImage(index, -1)}
                        className="rounded-full border border-ivory/15 px-2 py-0.5 text-[10px] text-mist disabled:opacity-30"
                        aria-label="Move earlier"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === values.images.length - 1}
                        onClick={() => moveImage(index, 1)}
                        className="rounded-full border border-ivory/15 px-2 py-0.5 text-[10px] text-mist disabled:opacity-30"
                        aria-label="Move later"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        className="ml-auto rounded-full bg-red-950/80 px-2 py-0.5 text-[10px] text-red-200"
                        onClick={() =>
                          patch((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, imageIndex) => imageIndex !== index)
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <PublishActionsFooter
        published={values.published}
        onPublishedChange={trySetPublished}
        requirementsHint="Requires name, card summary, price, and at least one photo in both languages."
        issues={publishIssues}
        status={status}
        message={message}
      />
    </form>
  );
});
