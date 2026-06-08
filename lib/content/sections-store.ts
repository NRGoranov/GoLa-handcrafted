import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { sectionToInput } from "@/lib/content/section-schema";
import type { ContentSection, ContentSectionInput } from "@/types/content-section";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

const JSON_PATH = path.join(process.cwd(), "data", "content-sections.json");

type DbRow = {
  id: string;
  slug: string;
  layout: ContentSection["layout"];
  sort_order: number;
  published: boolean;
  eyebrow_en: string;
  eyebrow_bg: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  body_en: string;
  body_bg: string;
  bullets: string[] | null;
  image_url: string | null;
  image_alt_en: string;
  image_alt_bg: string;
  cta_label_en: string;
  cta_label_bg: string;
  cta_href: string | null;
  highlight_title_en: string;
  highlight_title_bg: string;
  highlight_body_en: string;
  highlight_body_bg: string;
  created_at: string;
  updated_at: string;
};

function emptyLocalized() {
  return { en: "", bg: "" };
}

function rowToSection(row: DbRow): ContentSection {
  const bullets =
    row.bullets && row.bullets.length === 3
      ? (row.bullets as [string, string, string])
      : null;

  return {
    id: row.id,
    slug: row.slug,
    layout: row.layout,
    sortOrder: row.sort_order,
    published: row.published,
    eyebrow: { en: row.eyebrow_en, bg: row.eyebrow_bg },
    title: { en: row.title_en, bg: row.title_bg },
    description: { en: row.description_en, bg: row.description_bg },
    body: { en: row.body_en, bg: row.body_bg },
    bullets,
    imageUrl: row.image_url,
    imageAlt: { en: row.image_alt_en, bg: row.image_alt_bg },
    ctaLabel: { en: row.cta_label_en, bg: row.cta_label_bg },
    ctaHref: row.cta_href,
    highlightTitle: { en: row.highlight_title_en, bg: row.highlight_title_bg },
    highlightBody: { en: row.highlight_body_en, bg: row.highlight_body_bg },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function sectionToRow(section: ContentSection): DbRow {
  return {
    id: section.id,
    slug: section.slug,
    layout: section.layout,
    sort_order: section.sortOrder,
    published: section.published,
    eyebrow_en: section.eyebrow.en,
    eyebrow_bg: section.eyebrow.bg,
    title_en: section.title.en,
    title_bg: section.title.bg,
    description_en: section.description.en,
    description_bg: section.description.bg,
    body_en: section.body.en,
    body_bg: section.body.bg,
    bullets: section.bullets,
    image_url: section.imageUrl,
    image_alt_en: section.imageAlt.en,
    image_alt_bg: section.imageAlt.bg,
    cta_label_en: section.ctaLabel.en,
    cta_label_bg: section.ctaLabel.bg,
    cta_href: section.ctaHref,
    highlight_title_en: section.highlightTitle.en,
    highlight_title_bg: section.highlightTitle.bg,
    highlight_body_en: section.highlightBody.en,
    highlight_body_bg: section.highlightBody.bg,
    created_at: section.createdAt,
    updated_at: section.updatedAt
  };
}

function inputToSection(input: ContentSectionInput, id?: string): ContentSection {
  const now = new Date().toISOString();
  return {
    id: id ?? randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now
  };
}

async function readJsonSections(): Promise<ContentSection[]> {
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as ContentSection[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonSections(sections: ContentSection[]): Promise<void> {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, `${JSON.stringify(sections, null, 2)}\n`, "utf8");
}

export async function listSections(options?: { publishedOnly?: boolean }): Promise<ContentSection[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    let query = supabase.from("content_sections").select("*").order("sort_order", { ascending: true });
    if (options?.publishedOnly) {
      query = query.eq("published", true);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as DbRow[]).map(rowToSection);
  }

  const sections = await readJsonSections();
  const filtered = options?.publishedOnly ? sections.filter((section) => section.published) : sections;
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSectionById(id: string): Promise<ContentSection | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("content_sections").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToSection(data as DbRow) : null;
  }

  const sections = await readJsonSections();
  return sections.find((section) => section.id === id) ?? null;
}

export async function createSection(input: ContentSectionInput): Promise<ContentSection> {
  const section = inputToSection(input);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from("content_sections")
      .insert(sectionToRow(section))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return rowToSection(data as DbRow);
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to save sections in production.");
  }

  const sections = await readJsonSections();
  sections.push(section);
  await writeJsonSections(sections);
  return section;
}

export async function updateSection(id: string, input: ContentSectionInput): Promise<ContentSection> {
  const existing = await getSectionById(id);
  if (!existing) throw new Error("Section not found.");

  const section: ContentSection = {
    ...inputToSection(input, id),
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("content_sections")
      .update(sectionToRow(section))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return rowToSection(data as DbRow);
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to save sections in production.");
  }

  const sections = await readJsonSections();
  const index = sections.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Section not found.");
  sections[index] = section;
  await writeJsonSections(sections);
  return section;
}

export async function reorderCmsSections(orderedIds: string[]): Promise<void> {
  const sections = await listSections();
  const sectionMap = new Map(sections.map((section) => [section.id, section]));

  for (let index = 0; index < orderedIds.length; index += 1) {
    const section = sectionMap.get(orderedIds[index]);
    if (!section || section.sortOrder === index) continue;

    await updateSection(section.id, { ...sectionToInput(section), sortOrder: index });
  }
}

export async function deleteSection(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("content_sections").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to delete sections in production.");
  }

  const sections = await readJsonSections();
  await writeJsonSections(sections.filter((section) => section.id !== id));
}

export function createEmptySectionInput(sortOrder: number): ContentSectionInput {
  return {
    slug: "",
    layout: "split-left",
    sortOrder,
    published: false,
    eyebrow: emptyLocalized(),
    title: emptyLocalized(),
    description: emptyLocalized(),
    body: emptyLocalized(),
    bullets: null,
    imageUrl: null,
    imageAlt: emptyLocalized(),
    ctaLabel: emptyLocalized(),
    ctaHref: null,
    highlightTitle: emptyLocalized(),
    highlightBody: emptyLocalized()
  };
}

export function getStorageMode(): "supabase" | "local-json" | "read-only" {
  if (isSupabaseConfigured()) return "supabase";
  if (process.env.NODE_ENV === "development") return "local-json";
  return "read-only";
}
