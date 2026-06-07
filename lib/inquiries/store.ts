import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  contactMethod: string;
  inquiryType: string;
  inquiryTypeLabel: string;
  message: string;
  location: string | null;
  preferredSize: string | null;
  status: "new" | "read" | "replied" | "closed";
  locale: string;
  createdAt: string;
};

export type InquiryCreateInput = Omit<InquiryRecord, "id" | "status" | "createdAt">;

const JSON_PATH = path.join(process.cwd(), "data", "inquiries.json");

async function readJsonInquiries(): Promise<InquiryRecord[]> {
  try {
    const raw = await fs.readFile(JSON_PATH, "utf8");
    const parsed = JSON.parse(raw) as InquiryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonInquiries(inquiries: InquiryRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, `${JSON.stringify(inquiries, null, 2)}\n`, "utf8");
}

export async function saveInquiry(input: InquiryCreateInput): Promise<InquiryRecord | null> {
  const record: InquiryRecord = {
    id: randomUUID(),
    ...input,
    status: "new",
    createdAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("inquiries").insert({
      id: record.id,
      name: record.name,
      email: record.email,
      contact_method: record.contactMethod,
      inquiry_type: record.inquiryType,
      inquiry_type_label: record.inquiryTypeLabel,
      message: record.message,
      location: record.location,
      preferred_size: record.preferredSize,
      status: record.status,
      locale: record.locale,
      created_at: record.createdAt
    });
    if (error) throw new Error(error.message);
    return record;
  }

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const inquiries = await readJsonInquiries();
  inquiries.unshift(record);
  await writeJsonInquiries(inquiries);
  return record;
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      contactMethod: row.contact_method,
      inquiryType: row.inquiry_type,
      inquiryTypeLabel: row.inquiry_type_label,
      message: row.message,
      location: row.location,
      preferredSize: row.preferred_size,
      status: row.status,
      locale: row.locale,
      createdAt: row.created_at
    }));
  }

  const inquiries = await readJsonInquiries();
  return inquiries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryRecord["status"]
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Supabase is required for inquiry management in production.");
  }

  const inquiries = await readJsonInquiries();
  const index = inquiries.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Inquiry not found.");
  inquiries[index] = { ...inquiries[index], status };
  await writeJsonInquiries(inquiries);
}

export function getInquiryStorageMode(): "supabase" | "local-json" | "none" {
  if (isSupabaseConfigured()) return "supabase";
  if (process.env.NODE_ENV === "development") return "local-json";
  return "none";
}
