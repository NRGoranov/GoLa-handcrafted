import { NextResponse, type NextRequest } from "next/server";
import { getPreferredLocaleFromAcceptLanguage, isLocale, type Locale } from "@/lib/i18n";

const LOCALE_COOKIE = "site_locale";

function setLocaleCookie(response: NextResponse, request: NextRequest, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}

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
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-gola-locale", "en");
    return NextResponse.next({ request: { headers: requestHeaders } });
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
    return setLocaleCookie(response, request, preferred);
  }

  // If missing locale prefix, redirect to preferred.
  if (!pathLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}${pathname}`;
    const response = NextResponse.redirect(url);
    return setLocaleCookie(response, request, preferred);
  }

  // Persist locale selection and pass it to this request so the 404 page
  // can match the URL before the browser stores the cookie.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-gola-locale", pathLocale);
  const response = NextResponse.next({
    request: { headers: requestHeaders }
  });
  return setLocaleCookie(response, request, pathLocale);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)"]
};

