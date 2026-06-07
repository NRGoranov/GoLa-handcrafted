"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/inquiries", label: "Inquiries" }
];

export default function AdminShell({
  children,
  storageMode
}: {
  children: React.ReactNode;
  storageMode: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-ivory">
      <header className="border-b border-ivory/10 bg-[#111]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-caramel">GoLa Admin</p>
            <p className="text-sm text-mist">Storage: {storageMode}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-caramel text-ink"
                      : "border border-ivory/15 text-mist hover:border-caramel/40 hover:text-ivory"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-ivory/15 px-4 py-2 text-sm text-mist transition hover:border-red-400/40 hover:text-red-200"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
