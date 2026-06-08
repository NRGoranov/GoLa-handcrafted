"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PublishField from "@/components/admin/PublishField";
import PublishActionsFooter from "@/components/admin/PublishActionsFooter";
import { type ContentSection } from "@/types/content-section";
import LayoutPicker from "@/components/admin/LayoutPicker";
import {
  publishIssueFieldIds,
  scrollToPublishField,
  validateSectionForPublish,
  type PublishIssue
} from "@/lib/admin/publish-validation";
import {
  contentSectionInputSchema,
  formValuesToInput,
  sectionToFormValues,
  type ContentSectionFormValues
} from "@/lib/content/section-schema";

type SectionEditorProps = {
  initialSection: ContentSection;
  onSaved?: (section: ContentSection) => void;
  onValuesChange?: (values: ContentSectionFormValues) => void;
  compact?: boolean;
};

function emptyBullets(): [string, string, string] {
  return ["", "", ""];
}

export default function SectionEditor({
  initialSection,
  onSaved,
  onValuesChange,
  compact = false
}: SectionEditorProps) {
  const [values, setValues] = useState<ContentSectionFormValues>(() => sectionToFormValues(initialSection));

  const patchValues = (updater: (prev: ContentSectionFormValues) => ContentSectionFormValues) => {
    setValues((prev) => updater(prev));
  };
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [publishIssues, setPublishIssues] = useState<PublishIssue[]>([]);
  const lastSyncedAtRef = useRef(initialSection.updatedAt);

  const invalidFields = useMemo(() => publishIssueFieldIds(publishIssues), [publishIssues]);

  useEffect(() => {
    lastSyncedAtRef.current = initialSection.updatedAt;
    setValues(sectionToFormValues(initialSection));
    setPublishIssues([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching sections
  }, [initialSection.id]);

  useEffect(() => {
    if (status === "saving") return;
    if (Date.parse(initialSection.updatedAt) <= Date.parse(lastSyncedAtRef.current)) return;
    lastSyncedAtRef.current = initialSection.updatedAt;
    setValues(sectionToFormValues(initialSection));
  }, [initialSection, status]);

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  useEffect(() => {
    if (publishIssues.length === 0) return;
    setPublishIssues(validateSectionForPublish(values));
  }, [values, publishIssues.length]);

  const updateLocalized = (
    field: keyof Pick<
      ContentSectionFormValues,
      "eyebrow" | "title" | "description" | "body" | "imageAlt" | "ctaLabel" | "highlightTitle" | "highlightBody"
    >,
    locale: "en" | "bg",
    nextValue: string
  ) => {
    patchValues((prev) => ({
      ...prev,
      [field]: { ...prev[field], [locale]: nextValue }
    }));
  };

  const trySetPublished = (nextPublished: boolean) => {
    if (!nextPublished) {
      setPublishIssues([]);
      patchValues((prev) => ({ ...prev, published: false }));
      return;
    }

    const issues = validateSectionForPublish(values);
    if (issues.length > 0) {
      setPublishIssues(issues);
      setStatus("error");
      setMessage("Complete the highlighted fields to publish.");
      scrollToPublishField(issues[0].fieldId);
      return;
    }

    setPublishIssues([]);
    patchValues((prev) => ({ ...prev, published: true }));
  };

  const onUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const result = (await response.json()) as { ok: boolean; url?: string; message?: string };
    if (!response.ok || !result.ok || !result.url) {
      throw new Error(result.message || "Upload failed.");
    }
    patchValues((prev) => ({ ...prev, imageUrl: result.url ?? null }));
    setMessage("Image uploaded.");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (values.published) {
      const issues = validateSectionForPublish(values);
      if (issues.length > 0) {
        setStatus("error");
        setPublishIssues(issues);
        setMessage("Complete the highlighted fields to publish.");
        scrollToPublishField(issues[0].fieldId);
        return;
      }
    }

    setStatus("saving");

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
      const result = (await response.json()) as {
        ok: boolean;
        section?: ContentSection;
        message?: string;
        issues?: PublishIssue[];
      };
      if (!response.ok || !result.ok || !result.section) {
        if (result.issues?.length) {
          setPublishIssues(result.issues);
          scrollToPublishField(result.issues[0].fieldId);
        }
        throw new Error(result.message || "Unable to save section.");
      }
      setStatus("success");
      setPublishIssues([]);
      setMessage(values.published ? "Section published." : "Draft saved.");
      lastSyncedAtRef.current = result.section.updatedAt;
      onSaved?.(result.section);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save section.");
    }
  };

  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${compact ? "" : "space-y-8"}`}>
      <section className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
        <h2 className="font-serif text-xl text-ivory">Section settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <PublishField
            fieldId="field-slug"
            label="Slug (anchor id)"
            invalid={invalidFields.has("field-slug")}
            hint={publishIssues.find((issue) => issue.fieldId === "field-slug")?.message}
          >
            <input
              className="admin-input"
              value={values.slug}
              onChange={(event) => patchValues((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="atelier-story"
            />
          </PublishField>
          <PublishField fieldId="field-sort-order" label="Sort order">
            <input
              className="admin-input"
              type="number"
              min={0}
              value={values.sortOrder}
              onChange={(event) =>
                patchValues((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))
              }
            />
          </PublishField>
        </div>
        <div className="mt-5">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-mist">Layout</p>
          <LayoutPicker
            value={values.layout}
            onChange={(layout) => patchValues((prev) => ({ ...prev, layout }))}
          />
        </div>
      </section>

      <LocalizedBlock
        title="Heading"
        values={values}
        onChange={updateLocalized}
        invalidFields={invalidFields}
        publishIssues={publishIssues}
        fields={[
          { key: "eyebrow", label: "Eyebrow", fieldId: "field-eyebrow" },
          { key: "title", label: "Title", fieldId: "field-title", required: true },
          { key: "description", label: "Description", fieldId: "field-description", required: true, textarea: true }
        ]}
      />

      <LocalizedBlock
        title="Body copy"
        values={values}
        onChange={updateLocalized}
        invalidFields={invalidFields}
        publishIssues={publishIssues}
        fields={[{ key: "body", label: "Body paragraph", fieldId: "field-body", textarea: true }]}
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
                patchValues((prev) => ({ ...prev, bullets: next }));
              }}
            />
          ))}
          <button
            type="button"
            className="text-sm text-caramel underline"
            onClick={() => patchValues((prev) => ({ ...prev, bullets: null }))}
          >
            Clear bullets
          </button>
        </div>
      </section>

      <LocalizedBlock
        title="Highlight callout"
        values={values}
        onChange={updateLocalized}
        invalidFields={invalidFields}
        publishIssues={publishIssues}
        fields={[
          { key: "highlightTitle", label: "Highlight title", fieldId: "field-highlightTitle" },
          { key: "highlightBody", label: "Highlight body", fieldId: "field-highlightBody", textarea: true }
        ]}
      />

      <section
        id="field-image"
        className={`scroll-mt-24 rounded-2xl border bg-[#111] p-6 ${
          invalidFields.has("field-image") ? "border-red-400/50 ring-1 ring-red-400/40" : "border-ivory/10"
        }`}
      >
        <h2 className="font-serif text-2xl text-ivory">
          Image{values.layout !== "text-only" ? " · required" : ""}
        </h2>
        {invalidFields.has("field-image") ? (
          <p className="mt-1 text-xs text-red-200/90">
            {publishIssues.find((issue) => issue.fieldId === "field-image")?.message}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-mist">
          Upload a file or paste a path/URL below. Uploaded files are stored in Supabase and work on the live site.
        </p>
        <div className="mt-4 space-y-4">
          <ImageUploadField
            label="Upload section image"
            hint="Click Choose file and select a photo. When upload completes, the URL field fills in automatically."
            onUpload={onUpload}
          />
          <PublishField label="Or paste image URL / site path">
            <input
              className="admin-input"
              value={values.imageUrl ?? ""}
              onChange={(event) =>
                patchValues((prev) => ({ ...prev, imageUrl: event.target.value || null }))
              }
              placeholder="/images/heroRotation/hero-2.jpeg"
            />
          </PublishField>
          <LocalizedBlock
            title="Image alt text"
            values={values}
            onChange={updateLocalized}
            invalidFields={invalidFields}
            publishIssues={publishIssues}
            fields={[{ key: "imageAlt", label: "Alt text", fieldId: "field-imageAlt", required: Boolean(values.imageUrl?.trim()) }]}
            compact
          />
        </div>
      </section>

      <LocalizedBlock
        title="Optional CTA"
        values={values}
        onChange={updateLocalized}
        invalidFields={invalidFields}
        publishIssues={publishIssues}
        fields={[{ key: "ctaLabel", label: "Button label", fieldId: "field-ctaLabel" }]}
      />
      <PublishField fieldId="field-ctaHref" label="CTA link">
        <input
          className="admin-input"
          value={values.ctaHref ?? ""}
          onChange={(event) => patchValues((prev) => ({ ...prev, ctaHref: event.target.value || null }))}
          placeholder="#inquiry or https://..."
        />
      </PublishField>

      <PublishActionsFooter
        published={values.published}
        onPublishedChange={trySetPublished}
        requirementsHint={`Requires slug, both titles, both descriptions${values.layout !== "text-only" ? ", image + alt text" : ""}.`}
        issues={publishIssues}
        status={status}
        message={message}
      />
    </form>
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
  invalidFields,
  publishIssues,
  compact = false
}: {
  title: string;
  values: ContentSectionFormValues;
  onChange: (field: LocalizedFieldKey, locale: "en" | "bg", value: string) => void;
  fields: Array<{
    key: LocalizedFieldKey;
    label: string;
    fieldId: string;
    required?: boolean;
    textarea?: boolean;
  }>;
  invalidFields: Set<string>;
  publishIssues: PublishIssue[];
  compact?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-ivory/10 bg-[#111] ${compact ? "p-4" : "p-6"}`}>
      {!compact ? <h2 className="font-serif text-2xl text-ivory">{title}</h2> : null}
      <div className={`grid gap-4 ${compact ? "mt-0" : "mt-6"} md:grid-cols-2`}>
        {(["en", "bg"] as const).map((locale) => (
          <div key={locale} className="space-y-4">
            <p className="text-xs uppercase tracking-[0.16em] text-caramel">{locale === "en" ? "English" : "Bulgarian"}</p>
            {fields.map((field) => {
              const fieldId = `${field.fieldId}-${locale}`;
              const invalid = field.required ? invalidFields.has(fieldId) : false;
              const hint = publishIssues.find((issue) => issue.fieldId === fieldId)?.message;

              return (
                <PublishField
                  key={`${locale}-${field.key}`}
                  fieldId={fieldId}
                  label={field.label}
                  invalid={invalid}
                  hint={hint}
                >
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
                </PublishField>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
