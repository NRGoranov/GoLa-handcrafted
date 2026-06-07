"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const result = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Login failed.");
      }
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-ivory/10 bg-[#111] p-8 shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.24em] text-caramel">GoLa Admin</p>
        <h1 className="mt-3 font-serif text-3xl text-ivory">Sign in</h1>
        <p className="mt-2 text-sm text-mist">Use the admin password configured in your environment variables.</p>

        <label className="mt-8 block space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-mist">Password</span>
          <input
            type="password"
            className="admin-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-6 w-full rounded-full bg-caramel px-6 py-3 text-sm font-medium text-ink disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {message ? <p className="mt-4 text-sm text-red-300">{message}</p> : null}
      </form>
    </div>
  );
}
