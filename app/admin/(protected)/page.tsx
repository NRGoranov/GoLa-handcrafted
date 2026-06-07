import AdminShell from "@/components/admin/AdminShell";
import { getStorageMode } from "@/lib/content/sections-store";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import Link from "next/link";

export default function AdminDashboardPage() {
  const storageMode = getStorageMode();
  const supabaseReady = isSupabaseConfigured();

  return (
    <AdminShell storageMode={storageMode}>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-4xl text-ivory">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Manage homepage sections, publish bilingual content, and review inquiry submissions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-ivory/10 bg-[#111] p-6">
            <h2 className="font-serif text-2xl">Content sections</h2>
            <p className="mt-2 text-sm text-mist">
              Create new homepage blocks with predefined layouts, English and Bulgarian copy, and optional images.
            </p>
            <Link
              href="/admin/sections"
              className="focus-ring mt-5 inline-flex rounded-full bg-caramel px-5 py-2.5 text-sm font-medium text-ink"
            >
              Manage sections
            </Link>
          </article>

          <article className="rounded-2xl border border-ivory/10 bg-[#111] p-6">
            <h2 className="font-serif text-2xl">Inquiries</h2>
            <p className="mt-2 text-sm text-mist">
              {supabaseReady
                ? "Review form submissions saved to Supabase and emailed to your inbox."
                : "Form emails work with SMTP. Connect Supabase to store inquiries in the admin inbox."}
            </p>
            <Link
              href="/admin/inquiries"
              className="focus-ring mt-5 inline-flex rounded-full border border-caramel/50 px-5 py-2.5 text-sm font-medium text-caramel"
            >
              View inquiries
            </Link>
          </article>
        </div>

        {!supabaseReady ? (
          <div className="rounded-2xl border border-caramel/30 bg-caramel/10 p-5 text-sm text-ivory/90">
            <p className="font-medium text-caramel">Production setup recommended</p>
            <p className="mt-2">
              On Vercel, add Supabase environment variables so section edits and inquiry storage persist. See{" "}
              <code className="rounded bg-black/30 px-1.5 py-0.5">ADMIN_SETUP.md</code>.
            </p>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
