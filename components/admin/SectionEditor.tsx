"use client";

import { useMemo, useState } from "react";
import {
  SECTION_LAYOUTS,
  SECTION_LAYOUT_LABELS,
  type ContentSection
} from "@/types/content-section";
import {
  contentSectionInputSchema,
  formValuesToInput,
  sectionToFormValues,
  type ContentSectionFormValues
} from "@/lib/content/section-schema";

type SectionEditorProps = {
  initialSection: ContentSection;
  onSaved?: (section: ContentSection) => void;
};

function emptyBullets(): [string, string, string] {
  return ["", "", ""];
}

export default function SectionEditor({ initialSection, onSaved }: SectionEditorProps) {
  const [values, setValues] = useState<ContentSectionFormValues>(() => sectionToFormValues(initialSection));
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const layoutHelp = useMemo(() => SECTION_LAYOUT_LABELS[values.layout].description, [values.layout]);

  const updateLocalized = (
    field: keyof Pick<
      ContentSectionFormValues,
      "eyebrow" | "title" | "description" | "body" | "imageAlt" | "ctaLabel" | "highlightTitle" | "highlightBody"
    >,
    locale: "en" | "bg",
    nextValue: string
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: { ...prev[field], [locale]: nextValue }
    }));
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.message || "Upload failed.");
      }
      setValues((prev) => ({ ...prev, imageUrl: result.url ?? null }));
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const parsed = contentSectionInputSchema.safeParse(values);
    if (!parsed.success) {
      setStatus("error");
      setMessage(parsed.error.issues[0]?.message ?? "Invalid section data.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/sections/${initialSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToInput(parsed.data))
      });
      const result = (await response.json()) as { ok: boolean; section?: ContentSection; message?: string };
      if (!response.ok || !result.ok || !result.section) {
        throw new Error(result.message || "Unable to save section.");
      }
      setStatus("success");
      setMessage("Section saved.");
      onSaved?.(result.section);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save section.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-2xl border border-ivory/10 bg-[#111] p-6">
        <h2 className="font-serif text-2xl text-ivory">Section settings</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Slug (used for anchor id)">
            <input
              className="admin-input"
              value={values.slug}
              onChange={(event) => setValues((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="atelier-story"
            />
          </Field>
          <Field label="Sort order">
            <input
              className="admin-input"
              type="number"
              min={0}
              value={values.sortOrder}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))
              }
            />
          </Field>
          <Field label="Layout">
            <select
              className="admin-input"
              value={values.layout}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  layout: event.target.value as ContentSectionFormValues["layout"]
                }))
              }
            >
              {SECTION_LAYOUTS.map((layout) => (
                <option key={layout} value={layout} className="bg-ink text-ivory">
                  {SECTION_LAYOUT_LABELS[layout].label}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-3 pt-7 text-sm text-mist">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(event) => setValues((prev) => ({ ...prev, published: event.target.checked }))}
            />
            Published on site
          </label>
        </div>
        <p className="mt-3 text-sm text-mist">{layoutHelp}</p>
      </section>

      <LocalizedBlock
        title="Heading"
        values={values}
        onChange={updateLocalized}
        fields={[
          { key: "eyebrow", label: "Eyebrow" },
          { key: "title", label: "Title" },
          { key: "description", label: "Description" }
        ]}
      />

      <LocalizedBlock
        title="Body copy"
        values={values}
        onChange={updateLocalized}
        fields={[{ key: "body", label: "Body paragraph", textarea: true }]}
      />

      <section className="rounded-2xl border border-ivory/10 bg-[#111] p-6">
        <h2 className="font-serif text-2xl text-ivory">Optional bullets</h2>
        <div className="mt-4 grid gap-3">
          {(values.bullets ?? emptyBullets()).map((bullet, index) => (
            <input
              key={index}
              className="admin-input"
              value={bullet}
              placeholder={`Bullet ${index + 1}`}
              onChange={(event) => {
                const next = [...(values.bullets ?? emptyBullets())] as [string, string, string];
                next[index] = event.target.value;
                setValues((prev) => ({ ...prev, bullets: next }));
              }}
            />
          ))}
          <button
            type="button"
            className="text-sm text-caramel underline"
            onClick={() => setValues((prev) => ({ ...prev, bullets: null }))}
          >
            Clear bullets
          </button>
        </div>
      </section>

      <LocalizedBlock
        title="Highlight callout"
        values={values}
        onChange={updateLocalized}
        fields={[
          { key: "highlightTitle", label: "Highlight title" },
          { key: "highlightBody", label: "Highlight body", textarea: true }
        ]}
      />

      <section className="rounded-2xl border border-ivory/10 bg-[#111] p-6">
        <h2 className="font-serif text-2xl text-ivory">Image</h2>
        <div className="mt-4 space-y-4">
          <Field label="Image URL (site path or Supabase URL)">
            <input
              className="admin-input"
              value={values.imageUrl ?? ""}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, imageUrl: event.target.value || null }))
              }
              placeholder="/images/heroRotation/hero-2.jpeg"
            />
          </Field>
          <Field label="Upload image">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onUpload(file);
              }}
              className="block w-full text-sm text-mist file:mr-4 file:rounded-full file:border-0 file:bg-caramel file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
            />
          </Field>
          <LocalizedBlock
            title="Image alt text"
            values={values}
            onChange={updateLocalized}
            fields={[{ key: "imageAlt", label: "Alt text" }]}
            compact
          />
        </div>
      </section>

      <LocalizedBlock
        title="Optional CTA"
        values={values}
        onChange={updateLocalized}
        fields={[{ key: "ctaLabel", label: "Button label" }]}
      />
      <Field label="CTA link">
        <input
          className="admin-input"
          value={values.ctaHref ?? ""}
          onChange={(event) => setValues((prev) => ({ ...prev, ctaHref: event.target.value || null }))}
          placeholder="#inquiry or https://..."
        />
      </Field>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.16em] text-mist">{label}</span>
      {children}
    </label>
  );
}

type LocalizedFieldKey = keyof Pick<
  ContentSectionFormValues,
  "eyebrow" | "title" | "description" | "body" | "imageAlt" | "ctaLabel" | "highlightTitle" | "highlightBody"
>;

function LocalizedBlock({
  title,
  values,
  onChange,
  fields,
  compact = false
}: {
  title: string;
  values: ContentSectionFormValues;
  onChange: (field: LocalizedFieldKey, locale: "en" | "bg", value: string) => void;
  fields: Array<{
    key: LocalizedFieldKey;
    label: string;
    textarea?: boolean;
  }>;
  compact?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-ivory/10 bg-[#111] ${compact ? "p-4" : "p-6"}`}>
      {!compact ? <h2 className="font-serif text-2xl text-ivory">{title}</h2> : null}
      <div className={`grid gap-4 ${compact ? "mt-0" : "mt-6"} md:grid-cols-2`}>
        {(["en", "bg"] as const).map((locale) => (
          <div key={locale} className="space-y-4">
            <p className="text-xs uppercase tracking-[0.16em] text-caramel">{locale === "en" ? "English" : "Bulgarian"}</p>
            {fields.map((field) => (
              <Field key={`${locale}-${field.key}`} label={field.label}>
                {field.textarea ? (
                  <textarea
                    className="admin-input min-h-24"
                    value={values[field.key][locale]}
                    onChange={(event) => onChange(field.key, locale, event.target.value)}
                  />
                ) : (
                  <input
                    className="admin-input"
                    value={values[field.key][locale]}
                    onChange={(event) => onChange(field.key, locale, event.target.value)}
                  />
                )}
              </Field>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
