import { promises as fs } from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export type VisitStats = {
  totalVisits: number;
  visitsToday: number;
  visitsLast7Days: number;
  lastVisitAt: string | null;
};

type JsonAnalytics = {
  totalVisits: number;
  daily: Record<string, number>;
  lastVisitAt: string | null;
};

const JSON_PATH = path.join(process.cwd(), "data", "site-analytics.json");

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyStats(): VisitStats {
  return {
    totalVisits: 0,
    visitsToday: 0,
    visitsLast7Days: 0,
    lastVisitAt: null
  };
}

async function readJsonAnalytics(): Promise<JsonAnalytics> {
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as JsonAnalytics;
    return {
      totalVisits: parsed.totalVisits ?? 0,
      daily: parsed.daily ?? {},
      lastVisitAt: parsed.lastVisitAt ?? null
    };
  } catch {
    return { totalVisits: 0, daily: {}, lastVisitAt: null };
  }
}

async function writeJsonAnalytics(data: JsonAnalytics): Promise<void> {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function sumLastDays(daily: Record<string, number>, days: number): number {
  const today = new Date();
  let total = 0;

  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    const key = date.toISOString().slice(0, 10);
    total += daily[key] ?? 0;
  }

  return total;
}

function buildStatsFromJson(data: JsonAnalytics): VisitStats {
  const today = todayUtc();
  return {
    totalVisits: data.totalVisits,
    visitsToday: data.daily[today] ?? 0,
    visitsLast7Days: sumLastDays(data.daily, 7),
    lastVisitAt: data.lastVisitAt
  };
}

export async function getVisitStats(): Promise<VisitStats> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const [{ data: globalRow, error: globalError }, { data: dailyRows, error: dailyError }] =
      await Promise.all([
        supabase.from("site_visit_stats").select("total_visits,updated_at").eq("id", "global").maybeSingle(),
        supabase.from("site_visit_daily").select("visit_date,visit_count").order("visit_date", { ascending: false }).limit(7)
      ]);

    if (globalError) throw new Error(globalError.message);
    if (dailyError) throw new Error(dailyError.message);

    const today = todayUtc();
    const dailyMap = Object.fromEntries(
      (dailyRows ?? []).map((row) => [row.visit_date as string, row.visit_count as number])
    );

    return {
      totalVisits: Number(globalRow?.total_visits ?? 0),
      visitsToday: dailyMap[today] ?? 0,
      visitsLast7Days: (dailyRows ?? []).reduce((sum, row) => sum + Number(row.visit_count ?? 0), 0),
      lastVisitAt: (globalRow?.updated_at as string | null) ?? null
    };
  }

  if (process.env.NODE_ENV !== "development") {
    return emptyStats();
  }

  return buildStatsFromJson(await readJsonAnalytics());
}

export async function recordSiteVisit(): Promise<VisitStats> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.rpc("increment_site_visit");
    if (error) throw new Error(error.message);
    return getVisitStats();
  }

  if (process.env.NODE_ENV !== "development") {
    return emptyStats();
  }

  const data = await readJsonAnalytics();
  const today = todayUtc();
  const now = new Date().toISOString();

  data.totalVisits += 1;
  data.daily[today] = (data.daily[today] ?? 0) + 1;
  data.lastVisitAt = now;

  await writeJsonAnalytics(data);
  return buildStatsFromJson(data);
}

export function getVisitStorageMode(): "supabase" | "local-json" | "none" {
  if (isSupabaseConfigured()) return "supabase";
  if (process.env.NODE_ENV === "development") return "local-json";
  return "none";
}
