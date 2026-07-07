import { promises as fs } from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ProductRecord, ProductRecordInput } from "@/types/product-record";
import { getDefaultProductRecords } from "@/lib/products/seed-defaults";

const JSON_PATH = path.join(process.cwd(), "data", "products.json");

type DbRow = {
  id: string;
  product_kind: string;
  category_slug?: string | null;
  sort_order: number;
  published: boolean;
  model: number | null;
  name_en: string;
  name_bg: string;
  description_en: string;
  description_bg: string;
  card_summary_en: string;
  card_summary_bg: string;
  dimensions: string;
  width_cm: string;
  height_cm: string;
  thickness_cm: string;
  price_eur: number;
  pockets_add_on_eur: number | null;
  engraving_add_on_eur: number | null;
  images: string[];
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: DbRow): ProductRecord {
  return {
    id: row.id,
    productKind: row.product_kind as ProductRecord["productKind"],
    categorySlug: typeof row.category_slug === "string" ? row.category_slug : row.category_slug ?? null,
    sortOrder: row.sort_order,
    published: row.published,
    model: row.model,
    name: { en: row.name_en, bg: row.name_bg },
    description: { en: row.description_en, bg: row.description_bg },
    cardSummary: { en: row.card_summary_en, bg: row.card_summary_bg },
    dimensions: row.dimensions,
    widthCm: row.width_cm,
    heightCm: row.height_cm,
    thicknessCm: row.thickness_cm,
    priceEur: Number(row.price_eur),
    pocketsAddOnEur: row.pockets_add_on_eur,
    engravingAddOnEur: row.engraving_add_on_eur,
    images: row.images ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function recordToRow(record: ProductRecord): DbRow {
  return {
    id: record.id,
    product_kind: record.productKind,
    category_slug: record.categorySlug ?? null,
    sort_order: record.sortOrder,
    published: record.published,
    model: record.model,
    name_en: record.name.en,
    name_bg: record.name.bg,
    description_en: record.description.en,
    description_bg: record.description.bg,
    card_summary_en: record.cardSummary.en,
    card_summary_bg: record.cardSummary.bg,
    dimensions: record.dimensions,
    width_cm: record.widthCm,
    height_cm: record.heightCm,
    thickness_cm: record.thicknessCm,
    price_eur: record.priceEur,
    pockets_add_on_eur: record.pocketsAddOnEur,
    engraving_add_on_eur: record.engravingAddOnEur,
    images: record.images,
    created_at: record.createdAt,
    updated_at: record.updatedAt
  };
}

function inputToRecord(input: ProductRecordInput): ProductRecord {
  const now = new Date().toISOString();
  return { ...input, createdAt: now, updatedAt: now };
}

async function readJsonProducts(): Promise<ProductRecord[]> {
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as ProductRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonProducts(products: ProductRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, `${JSON.stringify(products, null, 2)}\n`, "utf8");
}

function isMissingProductsTable(message: string): boolean {
  const lowered = message.toLowerCase();
  return (
    lowered.includes("could not find the table") ||
    (lowered.includes("products") && (lowered.includes("schema cache") || lowered.includes("does not exist")))
  );
}

/** Local JSON is only used in dev when Supabase env vars are not set. */
function shouldUseJsonStorage(): boolean {
  return process.env.NODE_ENV === "development" && !isSupabaseConfigured();
}

async function listJsonProducts(options?: { publishedOnly?: boolean }): Promise<ProductRecord[]> {
  let products = await readJsonProducts();
  if (products.length === 0) {
    products = getDefaultProductRecords();
    await writeJsonProducts(products);
  }
  return filterPublished(products, options?.publishedOnly);
}

function filterPublished(products: ProductRecord[], publishedOnly?: boolean): ProductRecord[] {
  return publishedOnly ? products.filter((product) => product.published) : products;
}

function defaultProducts(publishedOnly?: boolean): ProductRecord[] {
  return filterPublished(getDefaultProductRecords(), publishedOnly);
}

/** Insert the 5 default catalog products (4 handbags + gift box) when storage is empty. */
export async function seedDefaultProducts(options?: { force?: boolean }): Promise<number> {
  const defaults = getDefaultProductRecords();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    if (!options?.force) {
      const { count, error: countError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true });

      if (countError) {
        if (isMissingProductsTable(countError.message) && shouldUseJsonStorage()) {
          const json = await readJsonProducts();
          if (json.length === 0) await writeJsonProducts(defaults);
          return defaults.length;
        }
        if (isMissingProductsTable(countError.message)) {
          throw new Error("Products table not found. Run supabase/gola-full-setup.sql in the SQL editor.");
        }
        throw new Error(countError.message);
      }

      if ((count ?? 0) > 0) return 0;
    }

    const { error } = await supabase
      .from("products")
      .upsert(defaults.map(recordToRow), { onConflict: "id" });

    if (error) throw new Error(error.message);
    return defaults.length;
  }

  if (shouldUseJsonStorage()) {
    await writeJsonProducts(defaults);
    return defaults.length;
  }

  return 0;
}

async function seedIfEmpty(): Promise<void> {
  await seedDefaultProducts();
}

export async function listProducts(options?: {
  publishedOnly?: boolean;
  skipSeed?: boolean;
}): Promise<ProductRecord[]> {
  if (!options?.skipSeed) {
    await seedIfEmpty();
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase.from("products").select("*").order("sort_order", { ascending: true });
    if (options?.publishedOnly) query = query.eq("published", true);
    const { data, error } = await query;
    if (error) {
      if (isMissingProductsTable(error.message) && shouldUseJsonStorage()) {
        return listJsonProducts(options);
      }
      if (isMissingProductsTable(error.message)) return defaultProducts(options?.publishedOnly);
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => rowToRecord(row as DbRow));
  }

  if (!shouldUseJsonStorage()) {
    return defaultProducts(options?.publishedOnly);
  }

  return listJsonProducts(options);
}

export async function getProduct(id: string): Promise<ProductRecord | null> {
  const products = await listProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function createProduct(input: ProductRecordInput): Promise<ProductRecord> {
  const record = inputToRecord(input);
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase.from("products").insert(recordToRow(record)).select("*").single();
    if (error) {
      if (isMissingProductsTable(error.message) && shouldUseJsonStorage()) {
        const products = await listJsonProducts();
        products.push(record);
        await writeJsonProducts(products);
        return record;
      }
      throw new Error(error.message);
    }
    return rowToRecord(data as DbRow);
  }

  if (!shouldUseJsonStorage()) {
    throw new Error("Supabase is required to save products in production.");
  }

  const products = await listJsonProducts();
  products.push(record);
  await writeJsonProducts(products);
  return record;
}

export async function updateProduct(id: string, input: ProductRecordInput): Promise<ProductRecord> {
  const existing = await getProduct(id);
  if (!existing) throw new Error("Product not found.");

  const record: ProductRecord = {
    ...input,
    id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .update(recordToRow(record))
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      if (isMissingProductsTable(error.message) && shouldUseJsonStorage()) {
        const products = await listJsonProducts();
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) throw new Error("Product not found.");
        products[index] = record;
        await writeJsonProducts(products);
        return record;
      }
      throw new Error(error.message);
    }
    return rowToRecord(data as DbRow);
  }

  if (!shouldUseJsonStorage()) {
    throw new Error("Supabase is required to save products in production.");
  }

  const products = await listJsonProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Product not found.");
  products[index] = record;
  await writeJsonProducts(products);
  return record;
}

export async function reorderProducts(orderedIds: string[]): Promise<ProductRecord[]> {
  const products = await listProducts({ skipSeed: true });
  const productMap = new Map(products.map((product) => [product.id, product]));

  if (orderedIds.length !== products.length) {
    throw new Error("Invalid product order.");
  }

  const reordered: ProductRecord[] = [];
  for (let index = 0; index < orderedIds.length; index += 1) {
    const product = productMap.get(orderedIds[index]);
    if (!product) throw new Error("Invalid product order.");
    reordered.push({
      ...product,
      sortOrder: index,
      updatedAt: new Date().toISOString()
    });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    for (const record of reordered) {
      const { error } = await supabase.from("products").update(recordToRow(record)).eq("id", record.id);
      if (error) {
        if (isMissingProductsTable(error.message) && shouldUseJsonStorage()) {
          await writeJsonProducts(reordered);
          return reordered;
        }
        throw new Error(error.message);
      }
    }
    return reordered;
  }

  if (!shouldUseJsonStorage()) {
    throw new Error("Supabase is required to reorder products in production.");
  }

  await writeJsonProducts(reordered);
  return reordered;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      if (isMissingProductsTable(error.message) && shouldUseJsonStorage()) {
        const products = await listJsonProducts();
        await writeJsonProducts(products.filter((p) => p.id !== id));
        return;
      }
      throw new Error(error.message);
    }
    return;
  }

  if (!shouldUseJsonStorage()) {
    throw new Error("Supabase is required to delete products in production.");
  }

  const products = await listJsonProducts();
  await writeJsonProducts(products.filter((p) => p.id !== id));
}

export function createEmptyProductInput(kind: "handbag" | "giftBox", sortOrder: number): ProductRecordInput {
  return {
    id: `product-${Date.now()}`,
    productKind: kind,
    categorySlug: null,
    sortOrder,
    published: false,
    model: kind === "handbag" ? 1 : null,
    name: { en: "New product", bg: "Нов продукт" },
    description: { en: "", bg: "" },
    cardSummary: { en: "", bg: "" },
    dimensions: "",
    widthCm: "",
    heightCm: "",
    thicknessCm: "",
    priceEur: 0,
    pocketsAddOnEur: kind === "handbag" ? 20 : null,
    engravingAddOnEur: kind === "handbag" ? 20 : null,
    images: []
  };
}

export async function createDraftProduct(kind: "handbag" | "giftBox"): Promise<ProductRecord> {
  const products = await listProducts();
  return createProduct(createEmptyProductInput(kind, products.length));
}
