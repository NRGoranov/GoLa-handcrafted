import { redirect } from "next/navigation";

export default async function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/studio?tab=sections&id=${encodeURIComponent(id)}`);
}
