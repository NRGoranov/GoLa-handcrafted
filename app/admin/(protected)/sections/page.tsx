"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { SECTION_LAYOUT_LABELS, type ContentSection } from "@/types/content-section";

export default function AdminSectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/sections");
    const result = (await response.json()) as { ok: boolean; sections?: ContentSection[]; message?: string };
    if (result.ok && result.sections) {
      setSections(result.sections);
    } else {
      setMessage(result.message || "Unable to load sections.");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const createSection = async () => {
    setMessage("");
    const response = await fetch("/api/admin/sections", { method: "PUT" });
    const result = (await response.json()) as { ok: boolean; section?: ContentSection; message?: string };
    if (!response.ok || !result.ok || !result.section) {
      setMessage(result.message || "Unable to create section.");
      return;
    }
    router.push(`/admin/sections/${result.section.id}/edit`);
  };

  const deleteSection = async (id: string) => {
    if (!window.confirm("Delete this section?")) return;
    const response = await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Unable to delete section.");
      return;
    }
    await load();
  };

  return (
    <AdminShell storageMode="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-ivory">Sections</h1>
            <p className="mt-2 text-sm text-mist">Published sections appear on the homepage after the custom section.</p>
          </div>
          <button
            type="button"
            onClick={createSection}
            className="rounded-full bg-caramel px-5 py-2.5 text-sm font-medium text-ink"
          >
            New section
          </button>
        </div>

        {message ? <p className="text-sm text-red-300">{message}</p> : null}
        {loading ? <p className="text-sm text-mist">Loading…</p> : null}

        <div className="space-y-3">
          {sections.map((section) => (
            <article
              key={section.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ivory/10 bg-[#111] p-5"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-caramel">
                  {SECTION_LAYOUT_LABELS[section.layout].label}
                </p>
                <h2 className="font-serif text-2xl text-ivory">{section.title.en || section.title.bg || section.slug}</h2>
                <p className="text-sm text-mist">
                  /#{section.slug} · order {section.sortOrder} ·{" "}
                  {section.published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/sections/${section.id}/edit`}
                  className="rounded-full border border-ivory/15 px-4 py-2 text-sm text-ivory"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void deleteSection(section.id)}
                  className="rounded-full border border-red-400/30 px-4 py-2 text-sm text-red-200"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!loading && sections.length === 0 ? (
            <p className="text-sm text-mist">No sections yet. Create your first block.</p>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
