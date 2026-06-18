import { promises as fs } from "fs";
import path from "path";
import { filterGalleryImages } from "@/lib/gallery-excluded-images";
import { getGalleryGroups as getFilesystemGalleryGroups } from "@/lib/galleryImages.server";
import { GALLERY_GROUP_SORT_ORDER } from "@/lib/galleryFolderMap";
import { getCopy, type Locale } from "@/lib/i18n";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { GalleryImageGroup } from "@/lib/galleryTypes";
import type { GalleryGroupInput, GalleryGroupRecord } from "@/types/gallery-record";

const JSON_PATH = path.join(process.cwd(), "data", "gallery-groups.json");

type DbRow = {
  id: string;
  label_en: string;
  label_bg: string;
  sort_order: number;
  images: string[];
  updated_at: string;
};

function rowToRecord(row: DbRow): GalleryGroupRecord {
  return {
    id: row.id,
    labelEn: row.label_en,
    labelBg: row.label_bg,
    sortOrder: row.sort_order,
    images: row.images ?? [],
    updatedAt: row.updated_at
  };
}

function recordToRow(record: GalleryGroupRecord): DbRow {
  return {
    id: record.id,
    label_en: record.labelEn,
    label_bg: record.labelBg,
    sort_order: record.sortOrder,
    images: record.images,
    updated_at: record.updatedAt
  };
}

async function readJsonRecords(): Promise<GalleryGroupRecord[]> {
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as GalleryGroupRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonRecords(records: GalleryGroupRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function buildDefaultRecords(): GalleryGroupRecord[] {
  const enLabels = getCopy("en").gallery.groups;
  const bgLabels = getCopy("bg").gallery.groups;
  const fsGroups = getFilesystemGalleryGroups(enLabels);
  const fsById = new Map(fsGroups.map((group) => [group.id, group]));
  const now = new Date().toISOString();

  const records: GalleryGroupRecord[] = GALLERY_GROUP_SORT_ORDER.map((key, index) => ({
    id: key,
    labelEn: enLabels[key as keyof typeof enLabels],
    labelBg: bgLabels[key as keyof typeof bgLabels],
    sortOrder: index,
    images: filterGalleryImages(fsById.get(key)?.images ?? []),
    updatedAt: now
  }));

  for (const group of fsGroups) {
    if (records.some((record) => record.id === group.id)) continue;
    records.push({
      id: group.id,
      labelEn: group.label,
      labelBg: group.label,
      sortOrder: records.length,
      images: filterGalleryImages(group.images),
      updatedAt: now
    });
  }

  return records;
}

async function seedIfEmpty(): Promise<void> {
  const existing = await listGalleryGroups({ skipSeed: true });
  if (existing.length > 0) return;

  const defaults = buildDefaultRecords();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from("gallery_groups").upsert(defaults.map(recordToRow), {
      onConflict: "id"
    });
    if (error && !error.message.toLowerCase().includes("gallery_groups")) {
      throw new Error(error.message);
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    await writeJsonRecords(defaults);
  }
}

export function recordsToGalleryGroups(
  records: GalleryGroupRecord[],
  locale: Locale
): GalleryImageGroup[] {
  return [...records]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
    .map((record) => ({
      id: record.id,
      label: locale === "bg" ? record.labelBg : record.labelEn,
      images: filterGalleryImages(record.images)
    }));
}

export async function listGalleryGroups(options?: {
  skipSeed?: boolean;
}): Promise<GalleryGroupRecord[]> {
  if (!options?.skipSeed) {
    await seedIfEmpty();
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("gallery_groups")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      if (process.env.NODE_ENV === "development") {
        return readJsonRecords();
      }
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => rowToRecord(row as DbRow));
  }

  if (process.env.NODE_ENV !== "development") {
    return buildDefaultRecords();
  }

  let records = await readJsonRecords();
  if (records.length === 0 && !options?.skipSeed) {
    records = buildDefaultRecords();
    await writeJsonRecords(records);
  }

  return records.map((record) => ({
    ...record,
    images: filterGalleryImages(record.images)
  }));
}

export async function getGalleryGroupsForLocale(locale: Locale): Promise<GalleryImageGroup[]> {
  const records = await listGalleryGroups();
  return recordsToGalleryGroups(records, locale);
}

export async function createGalleryGroup(input: {
  labelEn: string;
  labelBg: string;
}): Promise<GalleryGroupRecord> {
  const records = await listGalleryGroups();
  const id = `group-${Date.now()}`;
  const record: GalleryGroupRecord = {
    id,
    labelEn: input.labelEn.trim() || "New group",
    labelBg: input.labelBg.trim() || input.labelEn.trim() || "Нова група",
    sortOrder: records.length,
    images: [],
    updatedAt: new Date().toISOString()
  };
  return saveGalleryGroup(record);
}

export async function saveGalleryGroup(record: GalleryGroupRecord): Promise<GalleryGroupRecord> {
  const next = {
    ...record,
    images: filterGalleryImages(record.images),
    updatedAt: new Date().toISOString()
  };
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from("gallery_groups")
      .upsert(recordToRow(next), { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return rowToRecord(data as DbRow);
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to save gallery groups in production.");
  }

  const records = await listGalleryGroups();
  const index = records.findIndex((entry) => entry.id === next.id);
  if (index === -1) records.push(next);
  else records[index] = next;
  await writeJsonRecords(records);
  return next;
}

export async function updateGalleryGroup(
  id: string,
  input: Partial<GalleryGroupInput>
): Promise<GalleryGroupRecord> {
  const records = await listGalleryGroups();
  const existing = records.find((record) => record.id === id);
  if (!existing) throw new Error("Gallery group not found.");

  return saveGalleryGroup({
    ...existing,
    labelEn: input.labelEn ?? existing.labelEn,
    labelBg: input.labelBg ?? existing.labelBg,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    images: input.images ?? existing.images
  });
}

export async function deleteGalleryGroup(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("gallery_groups").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to delete gallery groups in production.");
  }

  const records = await listGalleryGroups();
  await writeJsonRecords(records.filter((record) => record.id !== id));
}

export async function reorderGalleryGroups(orderedIds: string[]): Promise<GalleryGroupRecord[]> {
  const records = await listGalleryGroups();
  if (orderedIds.length !== records.length) {
    throw new Error("Invalid gallery group order.");
  }

  const reordered: GalleryGroupRecord[] = [];
  for (let index = 0; index < orderedIds.length; index += 1) {
    const record = records.find((entry) => entry.id === orderedIds[index]);
    if (!record) throw new Error("Invalid gallery group order.");
    reordered.push({ ...record, sortOrder: index, updatedAt: new Date().toISOString() });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    for (const record of reordered) {
      await supabase
        .from("gallery_groups")
        .update({ sort_order: record.sortOrder, updated_at: record.updatedAt })
        .eq("id", record.id);
    }
    return reordered;
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to reorder gallery groups in production.");
  }

  await writeJsonRecords(reordered);
  return reordered;
}

export function shouldUseJsonStorage(): boolean {
  return process.env.NODE_ENV === "development" && !isSupabaseConfigured();
}

/** Merge photos from public/images/gallery into stored groups (adds missing URLs only). */
export async function syncFilesystemGalleryImages(): Promise<GalleryGroupRecord[]> {
  const records = await listGalleryGroups({ skipSeed: true });
  if (records.length === 0) {
    const defaults = buildDefaultRecords();
    const saved: GalleryGroupRecord[] = [];
    for (const record of defaults) {
      saved.push(await saveGalleryGroup(record));
    }
    return saved;
  }

  const enLabels = getCopy("en").gallery.groups;
  const bgLabels = getCopy("bg").gallery.groups;
  const fsGroups = getFilesystemGalleryGroups(enLabels);
  const fsById = new Map(fsGroups.map((group) => [group.id, group]));
  const knownIds = new Set(records.map((record) => record.id));
  const now = new Date().toISOString();

  const merged = records.map((record) => {
    const fsGroup = fsById.get(record.id);
    if (!fsGroup?.images.length) return record;

    const images = filterGalleryImages([...record.images]);
    for (const url of filterGalleryImages(fsGroup.images)) {
      if (!images.includes(url)) images.push(url);
    }

    return images.length === record.images.length ? record : { ...record, images, updatedAt: now };
  });

  for (const fsGroup of fsGroups) {
    if (knownIds.has(fsGroup.id)) continue;
    merged.push({
      id: fsGroup.id,
      labelEn: enLabels[fsGroup.id as keyof typeof enLabels] ?? fsGroup.label,
      labelBg: bgLabels[fsGroup.id as keyof typeof bgLabels] ?? fsGroup.label,
      sortOrder: merged.length,
      images: filterGalleryImages([...fsGroup.images]),
      updatedAt: now
    });
  }

  const saved: GalleryGroupRecord[] = [];
  for (const record of merged) {
    saved.push(await saveGalleryGroup(record));
  }

  return saved.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}
