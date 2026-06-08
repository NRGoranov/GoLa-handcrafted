import { promises as fs } from "fs";
import path from "path";
import { getCopy, type Locale } from "@/lib/i18n";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  BUILTIN_SECTION_KEYS,
  type BuiltinSectionKey,
  type BuiltinSectionRecord
} from "@/types/builtin-section";

const JSON_PATH = path.join(process.cwd(), "data", "builtin-sections.json");

type DbRow = {
  section_key: string;
  content_en: Record<string, unknown>;
  content_bg: Record<string, unknown>;
  image_url: string | null;
  updated_at: string;
};

function defaultContent(key: BuiltinSectionKey, locale: Locale): Record<string, unknown> {
  const copy = getCopy(locale);
  return structuredClone(copy[key] as Record<string, unknown>);
}

function rowToRecord(row: DbRow): BuiltinSectionRecord {
  return {
    key: row.section_key as BuiltinSectionKey,
    contentEn: row.content_en ?? {},
    contentBg: row.content_bg ?? {},
    imageUrl: row.image_url,
    updatedAt: row.updated_at
  };
}

function recordToRow(record: BuiltinSectionRecord): DbRow {
  return {
    section_key: record.key,
    content_en: record.contentEn,
    content_bg: record.contentBg,
    image_url: record.imageUrl,
    updated_at: record.updatedAt
  };
}

async function readJsonRecords(): Promise<BuiltinSectionRecord[]> {
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as BuiltinSectionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonRecords(records: BuiltinSectionRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function buildDefaultRecord(key: BuiltinSectionKey): BuiltinSectionRecord {
  const now = new Date().toISOString();
  return {
    key,
    contentEn: defaultContent(key, "en"),
    contentBg: defaultContent(key, "bg"),
    imageUrl: null,
    updatedAt: now
  };
}

async function seedIfEmpty(): Promise<void> {
  const existing = await listBuiltinSections({ skipSeed: true });
  if (existing.length >= BUILTIN_SECTION_KEYS.length) return;

  const defaults = BUILTIN_SECTION_KEYS.map(buildDefaultRecord);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase
      .from("builtin_sections")
      .upsert(defaults.map(recordToRow), { onConflict: "section_key" });
    if (error && !error.message.toLowerCase().includes("builtin_sections")) {
      throw new Error(error.message);
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    await writeJsonRecords(defaults);
  }
}

export async function listBuiltinSections(options?: {
  skipSeed?: boolean;
}): Promise<BuiltinSectionRecord[]> {
  if (!options?.skipSeed) {
    await seedIfEmpty();
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("builtin_sections").select("*");
    if (error) {
      if (process.env.NODE_ENV === "development") {
        return readJsonRecords();
      }
      throw new Error(error.message);
    }
    const records = (data ?? []).map((row) => rowToRecord(row as DbRow));
    return BUILTIN_SECTION_KEYS.map(
      (key) => records.find((record) => record.key === key) ?? buildDefaultRecord(key)
    );
  }

  if (process.env.NODE_ENV !== "development") {
    return BUILTIN_SECTION_KEYS.map(buildDefaultRecord);
  }

  let records = await readJsonRecords();
  if (records.length === 0 && !options?.skipSeed) {
    records = BUILTIN_SECTION_KEYS.map(buildDefaultRecord);
    await writeJsonRecords(records);
  }

  return BUILTIN_SECTION_KEYS.map(
    (key) => records.find((record) => record.key === key) ?? buildDefaultRecord(key)
  );
}

export async function getBuiltinSection(key: BuiltinSectionKey): Promise<BuiltinSectionRecord> {
  const records = await listBuiltinSections();
  return records.find((record) => record.key === key) ?? buildDefaultRecord(key);
}

export async function updateBuiltinSection(
  key: BuiltinSectionKey,
  input: {
    contentEn: Record<string, unknown>;
    contentBg: Record<string, unknown>;
    imageUrl: string | null;
  }
): Promise<BuiltinSectionRecord> {
  const record: BuiltinSectionRecord = {
    key,
    contentEn: input.contentEn,
    contentBg: input.contentBg,
    imageUrl: input.imageUrl,
    updatedAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("builtin_sections")
      .upsert(recordToRow(record), { onConflict: "section_key" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return rowToRecord(data as DbRow);
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to save built-in sections in production.");
  }

  const records = await listBuiltinSections();
  const index = records.findIndex((entry) => entry.key === key);
  if (index === -1) records.push(record);
  else records[index] = record;
  await writeJsonRecords(records);
  return record;
}

export function shouldUseJsonStorage(): boolean {
  return process.env.NODE_ENV === "development" && !isSupabaseConfigured();
}
