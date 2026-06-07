import { NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminCookieName,
  isAdminConfigured,
  verifyAdminPassword
} from "@/lib/admin/session";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET." },
      { status: 503 }
    );
  }

  const body = (await req.json()) as { password?: string };
  const password = body.password?.trim() ?? "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, message: "Invalid password." }, { status: 401 });
  }

  const token = await createAdminSession();
  if (!token) {
    return NextResponse.json({ ok: false, message: "Unable to create session." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
