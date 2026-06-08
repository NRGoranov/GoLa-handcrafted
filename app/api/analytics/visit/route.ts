import { NextResponse } from "next/server";
import { recordSiteVisit } from "@/lib/analytics/visit-store";

const VISIT_COOKIE = "gola_visit_counted";
const VISIT_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours — one count per browsing session

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    if (cookieHeader.includes(`${VISIT_COOKIE}=1`)) {
      return NextResponse.json({ ok: true, counted: false });
    }

    const body = (await req.json().catch(() => ({}))) as { path?: string };
    if (body.path?.startsWith("/admin")) {
      return NextResponse.json({ ok: true, counted: false });
    }

    const stats = await recordSiteVisit();
    const response = NextResponse.json({ ok: true, counted: true, stats });
    response.cookies.set(VISIT_COOKIE, "1", {
      path: "/",
      maxAge: VISIT_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: true
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record visit.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
