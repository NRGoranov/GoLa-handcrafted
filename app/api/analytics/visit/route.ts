import { NextResponse } from "next/server";
import { recordSiteVisit } from "@/lib/analytics/visit-store";

const VISIT_COOKIE = "gola_visit_counted";
const VISIT_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours — one count per browsing session

function visitCookieOptions(maxAge: number) {
  return {
    path: "/",
    maxAge,
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { path?: string; consent?: string };

    if (body.consent !== "all" || body.path?.startsWith("/admin")) {
      const response = NextResponse.json({ ok: true, counted: false });
      response.cookies.set(VISIT_COOKIE, "", visitCookieOptions(0));
      return response;
    }

    const cookieHeader = req.headers.get("cookie") ?? "";
    if (cookieHeader.includes(`${VISIT_COOKIE}=1`)) {
      return NextResponse.json({ ok: true, counted: false });
    }

    await recordSiteVisit();
    const response = NextResponse.json({ ok: true, counted: true });
    response.cookies.set(VISIT_COOKIE, "1", visitCookieOptions(VISIT_COOKIE_MAX_AGE));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record visit.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
