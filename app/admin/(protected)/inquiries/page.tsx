"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import type { InquiryRecord } from "@/lib/inquiries/store";

const statuses: InquiryRecord["status"][] = ["new", "read", "replied", "closed"];

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/inquiries");
    const result = (await response.json()) as { ok: boolean; inquiries?: InquiryRecord[]; message?: string };
    if (result.ok && result.inquiries) {
      setInquiries(result.inquiries);
      setMessage("");
    } else {
      setMessage(result.message || "Unable to load inquiries.");
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (id: string, status: InquiryRecord["status"]) => {
    const response = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Unable to update inquiry.");
      return;
    }
    await load();
  };

  return (
    <AdminShell storageMode="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-4xl text-ivory">Inquiries</h1>
          <p className="mt-2 text-sm text-mist">
            Submissions from the live inquiry form. Email delivery still requires SMTP env vars on Vercel.
          </p>
        </div>

        {message ? <p className="text-sm text-red-300">{message}</p> : null}
        {loading ? <p className="text-sm text-mist">Loading…</p> : null}

        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-2xl border border-ivory/10 bg-[#111] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-ivory">{inquiry.name}</h2>
                  <p className="text-sm text-mist">
                    {inquiry.inquiryTypeLabel} · {new Date(inquiry.createdAt).toLocaleString()} · {inquiry.locale.toUpperCase()}
                  </p>
                  <p className="mt-2 text-sm">
                    <a href={`mailto:${inquiry.email}`} className="text-caramel underline">
                      {inquiry.email}
                    </a>{" "}
                    · {inquiry.contactMethod}
                  </p>
                </div>
                <select
                  className="admin-input w-auto"
                  value={inquiry.status}
                  onChange={(event) =>
                    void updateStatus(inquiry.id, event.target.value as InquiryRecord["status"])
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status} className="bg-ink text-ivory">
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-ivory/90">{inquiry.message}</p>
              {(inquiry.location || inquiry.preferredSize) && (
                <p className="mt-3 text-xs text-mist">
                  {inquiry.location ? `Location: ${inquiry.location}` : ""}
                  {inquiry.location && inquiry.preferredSize ? " · " : ""}
                  {inquiry.preferredSize ? `Preferred size: ${inquiry.preferredSize}` : ""}
                </p>
              )}
            </article>
          ))}
          {!loading && inquiries.length === 0 ? (
            <p className="text-sm text-mist">No inquiries stored yet.</p>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
