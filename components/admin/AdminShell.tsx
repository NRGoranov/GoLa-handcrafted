"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin/studio", label: "Content Studio", match: "/admin/studio" },
  { href: "/admin/inquiries", label: "Inquiries", match: "/admin/inquiries" }
];

export default function AdminShell({
  children,
  storageMode,
  wide = false
}: {
  children: React.ReactNode;
  storageMode: string;
  wide?: boolean;
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
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 ${
            wide ? "max-w-[1600px]" : "max-w-6xl"
          }`}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-caramel">GoLa Admin</p>
            <p className={`text-sm ${storageMode === "read-only" ? "text-red-300" : "text-mist"}`}>
              Storage:{" "}
              <strong className={storageMode === "read-only" ? "text-red-200" : "text-ivory"}>{storageMode}</strong>
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => {
              const active = pathname === link.match || pathname.startsWith(`${link.match}/`);
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
      <main className={`mx-auto px-4 py-8 sm:px-6 ${wide ? "max-w-[1600px]" : "max-w-6xl"}`}>{children}</main>
    </div>
  );
}
