import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";

export async function requireAdminApi() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  return null;
}
