import { NextResponse, type NextRequest } from "next/server";
import { getPreferredLocaleFromAcceptLanguage, isLocale, type Locale } from "@/lib/i18n";

const LOCALE_COOKIE = "site_locale";

function getPathLocale(pathname: string): Locale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) return first;
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal paths / files.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname === "/llms.txt"
  ) {
    return NextResponse.next();
  }

  const pathLocale = getPathLocale(pathname);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value ?? null;
  const preferred = cookieLocale && isLocale(cookieLocale)
    ? (cookieLocale satisfies Locale)
    : getPreferredLocaleFromAcceptLanguage(request.headers.get("accept-language"));

  // Root -> preferred locale.
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, preferred, { path: "/" });
    return response;
  }

  // If missing locale prefix, redirect to preferred.
  if (!pathLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}${pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, preferred, { path: "/" });
    return response;
  }

  // Persist locale selection.
  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, pathLocale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)"]
};

