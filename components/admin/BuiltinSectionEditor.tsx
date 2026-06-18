"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  BUILTIN_SECTION_FIELDS,
  getNestedValue,
  setNestedValue
} from "@/lib/content/builtin-section-fields";
import { BUILTIN_HOMEPAGE_SECTIONS } from "@/lib/content/builtin-sections";
import GalleryEditor from "@/components/admin/GalleryEditor";
import type { BuiltinSectionKey, BuiltinSectionRecord } from "@/types/builtin-section";

type BuiltinSectionEditorProps = {
  sectionKey: BuiltinSectionKey;
  initialSection: BuiltinSectionRecord;
  onValuesChange?: (section: BuiltinSectionRecord) => void;
  onSaved?: (section: BuiltinSectionRecord) => void;
  onGalleryUpdated?: () => void;
};

const SECTION_TITLES = Object.fromEntries(
  BUILTIN_HOMEPAGE_SECTIONS.map((section) => [section.key, section.title])
) as Record<BuiltinSectionKey, string>;

export default function BuiltinSectionEditor({
  sectionKey,
  initialSection,
  onValuesChange,
  onSaved,
  onGalleryUpdated
}: BuiltinSectionEditorProps) {
  const [contentEn, setContentEn] = useState<Record<string, unknown>>(initialSection.contentEn);
  const [contentBg, setContentBg] = useState<Record<string, unknown>>(initialSection.contentBg);
  const [imageUrl, setImageUrl] = useState<string | null>(initialSection.imageUrl);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const lastSyncedAtRef = useRef(initialSection.updatedAt);

  const fields = BUILTIN_SECTION_FIELDS[sectionKey];
  const showImage = sectionKey === "craftsmanship";

  useEffect(() => {
    onValuesChange?.({
      key: sectionKey,
      contentEn,
      contentBg,
      imageUrl,
      updatedAt: initialSection.updatedAt
    });
  }, [contentEn, contentBg, imageUrl, sectionKey, initialSection.updatedAt, onValuesChange]);

  useEffect(() => {
    lastSyncedAtRef.current = initialSection.updatedAt;
    setContentEn(initialSection.contentEn);
    setContentBg(initialSection.contentBg);
    setImageUrl(initialSection.imageUrl);
  }, [initialSection.key]);

  useEffect(() => {
    if (status === "saving") return;
    if (Date.parse(initialSection.updatedAt) <= Date.parse(lastSyncedAtRef.current)) return;
    lastSyncedAtRef.current = initialSection.updatedAt;
    setContentEn(initialSection.contentEn);
    setContentBg(initialSection.contentBg);
    setImageUrl(initialSection.imageUrl);
  }, [initialSection, status]);

  const patchLocale = (
    locale: "en" | "bg",
    path: string,
    value: unknown,
    type: "text" | "textarea" | "bullets"
  ) => {
    const setter = locale === "en" ? setContentEn : setContentBg;
    setter((prev) => {
      if (type === "bullets" && typeof value === "string") {
        const current = getNestedValue(prev, path);
        const bullets = Array.isArray(current) ? [...(current as string[])] : ["", "", ""];
        const index = Number(path.split(".").pop());
        if (!Number.isNaN(index)) {
          bullets[index] = value;
          const basePath = path.split(".").slice(0, -1).join(".");
          return setNestedValue(prev, basePath || path, bullets);
        }
        return setNestedValue(prev, path, value.split("\n").slice(0, 3));
      }
      return setNestedValue(prev, path, value);
    });
  };

  const onUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "sections");
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
    if (!response.ok || !result.ok || !result.url) {
      throw new Error(result.message || "Upload failed.");
    }
    setImageUrl(result.url);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/builtin-sections/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentEn, contentBg, imageUrl })
      });
      const result = (await response.json()) as { ok: boolean; section?: BuiltinSectionRecord; message?: string };
      if (!response.ok || !result.ok || !result.section) {
        throw new Error(result.message || "Unable to save section.");
      }
      setStatus("success");
      setMessage("Section saved. Changes appear on the live site.");
      lastSyncedAtRef.current = result.section.updatedAt;
      onSaved?.(result.section);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save section.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-caramel">Built-in section</p>
        <h2 className="font-serif text-2xl text-ivory">{SECTION_TITLES[sectionKey]}</h2>
        {sectionKey === "collection" || sectionKey === "giftBox" ? (
          <p className="mt-2 text-sm text-mist">
            Product cards and pricing are edited under{" "}
            <Link href="/admin/studio?tab=products" className="text-caramel underline">
              Products
            </Link>
            . This form controls the section heading and description text.
          </p>
        ) : sectionKey === "gallery" ? (
          <p className="mt-2 text-sm text-mist">
            Галерията се редактира тук по-долу: отвори секция → <strong className="text-ivory">Remove</strong> на
            снимка. Заглавията на секцията са в полетата English/Bulgarian по-долу. Снимките с джобове се скриват
            автоматично от сайта.
          </p>
        ) : null}
      </div>

      {sectionKey === "gallery" ? <GalleryEditor onUpdated={onGalleryUpdated} /> : null}

      {(["en", "bg"] as const).map((locale) => (
        <section key={locale} className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-caramel">
            {locale === "en" ? "English" : "Bulgarian"}
          </p>
          <div className="mt-4 space-y-3">
            {fields.map((field) => {
              const content = locale === "en" ? contentEn : contentBg;
              if (field.type === "bullets") {
                const bullets = (getNestedValue(content, field.path) as string[] | undefined) ?? ["", "", ""];
                return (
                  <div key={`${locale}-${field.path}`} className="space-y-2">
                    <p className="text-xs text-mist">{field.label}</p>
                    {bullets.map((bullet, index) => (
                      <textarea
                        key={`${field.path}-${index}`}
                        className="admin-input min-h-16 w-full"
                        value={bullet}
                        onChange={(e) =>
                          patchLocale(locale, `${field.path}.${index}`, e.target.value, "bullets")
                        }
                      />
                    ))}
                  </div>
                );
              }

              const value = (getNestedValue(content, field.path) as string | undefined) ?? "";
              return field.type === "textarea" ? (
                <textarea
                  key={`${locale}-${field.path}`}
                  className="admin-input min-h-24 w-full"
                  placeholder={field.label}
                  value={value}
                  onChange={(e) => patchLocale(locale, field.path, e.target.value, field.type)}
                />
              ) : (
                <input
                  key={`${locale}-${field.path}`}
                  className="admin-input w-full"
                  placeholder={field.label}
                  value={value}
                  onChange={(e) => patchLocale(locale, field.path, e.target.value, field.type)}
                />
              );
            })}
          </div>
        </section>
      ))}

      {showImage ? (
        <section className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
          <h3 className="font-serif text-lg text-ivory">Section image</h3>
          <p className="mt-1 text-xs text-mist">Optional. Replaces the default craftsmanship photo when set.</p>
          {imageUrl ? (
            <p className="mt-2 break-all text-xs text-mist">{imageUrl}</p>
          ) : null}
          <ImageUploadField label="Upload image" onUpload={onUpload} />
          {imageUrl ? (
            <button
              type="button"
              className="mt-2 text-xs text-red-300 underline"
              onClick={() => setImageUrl(null)}
            >
              Remove image (use default)
            </button>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save section"}
        </button>
        {message ? (
          <p className={`text-sm ${status === "error" ? "text-red-300" : "text-caramel"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
