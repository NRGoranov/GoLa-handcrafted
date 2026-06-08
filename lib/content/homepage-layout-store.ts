import { promises as fs } from "fs";
import path from "path";
import { listSections } from "@/lib/content/sections-store";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import { builtinSelectionId } from "@/types/builtin-section";
import {
  buildDefaultHomepageLayout,
  isValidHomepageLayout,
  normalizeHomepageLayout,
  type HomepageBlockId
} from "@/types/homepage-layout";

const JSON_PATH = path.join(process.cwd(), "data", "homepage-layout.json");
const LAYOUT_ID = "default";

type LayoutRecord = {
  blockOrder: HomepageBlockId[];
  updatedAt: string;
};

async function readJsonLayout(): Promise<LayoutRecord | null> {
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as LayoutRecord;
    if (!Array.isArray(parsed.blockOrder)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeJsonLayout(record: LayoutRecord): Promise<void> {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

async function readSavedBlockOrder(): Promise<HomepageBlockId[] | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("homepage_layout")
      .select("block_order")
      .eq("id", LAYOUT_ID)
      .maybeSingle();
    if (error) {
      if (
        process.env.NODE_ENV === "development" ||
        error.message.toLowerCase().includes("homepage_layout")
      ) {
        const local = await readJsonLayout();
        return local?.blockOrder ?? null;
      }
      throw new Error(error.message);
    }
    return (data?.block_order as HomepageBlockId[] | null) ?? null;
  }

  if (process.env.NODE_ENV !== "development") return null;
  const local = await readJsonLayout();
  return local?.blockOrder ?? null;
}

async function cmsSectionIds(): Promise<string[]> {
  const sections = await listSections();
  return sections
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug))
    .map((section) => section.id);
}

export async function getResolvedHomepageLayout(): Promise<HomepageBlockId[]> {
  const cmsIds = await cmsSectionIds();
  const saved = await readSavedBlockOrder();
  return normalizeHomepageLayout(saved, cmsIds);
}

export async function getHomepageLayoutRecord(): Promise<LayoutRecord> {
  const blockOrder = await getResolvedHomepageLayout();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data } = await supabase
      .from("homepage_layout")
      .select("updated_at")
      .eq("id", LAYOUT_ID)
      .maybeSingle();
    return {
      blockOrder,
      updatedAt: (data?.updated_at as string | undefined) ?? new Date().toISOString()
    };
  }

  const local = process.env.NODE_ENV === "development" ? await readJsonLayout() : null;
  return {
    blockOrder,
    updatedAt: local?.updatedAt ?? new Date().toISOString()
  };
}

export async function updateHomepageLayout(blockOrder: HomepageBlockId[]): Promise<LayoutRecord> {
  const cmsIds = await cmsSectionIds();
  if (!isValidHomepageLayout(blockOrder, cmsIds)) {
    throw new Error("Invalid homepage layout order.");
  }

  const record: LayoutRecord = {
    blockOrder,
    updatedAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("homepage_layout").upsert(
      {
        id: LAYOUT_ID,
        block_order: blockOrder,
        updated_at: record.updatedAt
      },
      { onConflict: "id" }
    );
    if (error) {
      if (process.env.NODE_ENV === "development") {
        await writeJsonLayout(record);
        await syncCmsSortOrder(blockOrder, cmsIds);
        return record;
      }
      throw new Error(error.message);
    }
    await syncCmsSortOrder(blockOrder, cmsIds);
    return record;
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required to save homepage layout in production.");
  }

  await writeJsonLayout(record);
  await syncCmsSortOrder(blockOrder, cmsIds);
  return record;
}

async function syncCmsSortOrder(blockOrder: HomepageBlockId[], cmsIds: string[]): Promise<void> {
  const cmsSet = new Set(cmsIds);
  const cmsInLayout = blockOrder.filter((blockId) => cmsSet.has(blockId));
  if (cmsInLayout.length === 0) return;

  const { reorderCmsSections } = await import("@/lib/content/sections-store");
  await reorderCmsSections(cmsInLayout);
}

export async function registerNewCmsBlock(sectionId: string): Promise<void> {
  const layout = await getResolvedHomepageLayout();
  if (layout.includes(sectionId)) return;

  const insertAfter = builtinSelectionId("custom");
  const index = layout.indexOf(insertAfter);
  const next = [...layout];
  next.splice(index === -1 ? next.length : index + 1, 0, sectionId);
  await updateHomepageLayout(next);
}

export async function unregisterCmsBlock(sectionId: string): Promise<void> {
  const cmsIds = await cmsSectionIds();
  const saved = await readSavedBlockOrder();

  if (saved?.includes(sectionId)) {
    await updateHomepageLayout(
      normalizeHomepageLayout(
        saved.filter((blockId) => blockId !== sectionId),
        cmsIds
      )
    );
    return;
  }

  const layout = await getResolvedHomepageLayout();
  if (!layout.includes(sectionId)) return;
  await updateHomepageLayout(layout.filter((blockId) => blockId !== sectionId));
}

export function shouldUseJsonStorage(): boolean {
  return process.env.NODE_ENV === "development" && !isSupabaseConfigured();
}

export { buildDefaultHomepageLayout };
