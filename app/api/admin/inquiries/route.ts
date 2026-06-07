import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { listInquiries, updateInquiryStatus } from "@/lib/inquiries/store";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const inquiries = await listInquiries();
    return NextResponse.json({ ok: true, inquiries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load inquiries.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await req.json()) as { id?: string; status?: "new" | "read" | "replied" | "closed" };
    if (!body.id || !body.status) {
      return NextResponse.json({ ok: false, message: "Missing id or status." }, { status: 400 });
    }

    await updateInquiryStatus(body.id, body.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update inquiry.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
