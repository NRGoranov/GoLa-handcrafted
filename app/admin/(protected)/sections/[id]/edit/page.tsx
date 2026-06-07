import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import SectionEditor from "@/components/admin/SectionEditor";
import { getSectionById, getStorageMode } from "@/lib/content/sections-store";

export default async function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = await getSectionById(id);
  if (!section) notFound();

  return (
    <AdminShell storageMode={getStorageMode()}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-caramel">Edit section</p>
            <h1 className="font-serif text-4xl text-ivory">{section.title.en || section.slug}</h1>
          </div>
          <Link href="/admin/sections" className="text-sm text-caramel underline">
            Back to sections
          </Link>
        </div>
        <SectionEditor initialSection={section} />
      </div>
    </AdminShell>
  );
}
