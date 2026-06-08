import { redirect } from "next/navigation";

export default function AdminSectionsPage() {
  redirect("/admin/studio?tab=sections");
}
