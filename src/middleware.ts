import { localeHeader } from "@/lib/headers";
import {
  defaultLocale,
  getLocaleFromPathname,
  removeLocaleFromPathname,
} from "@/lib/locale";
import { NextResponse, type NextRequest } from "next/server";

const knownLocales = [
  "da-DK", "de-DE", "en-GB", "es-ES", "fr-FR",
  "it-IT", "nl-NL", "pt-PT", "sv-SE"
];

export const middleware = (request: NextRequest) => {
  const { headers } = request;
  const originalPathname = request.nextUrl.pathname;

  // --- 1. Handle static chunk rewrites based on referer locale ---
  const isStaticChunk = originalPathname.startsWith("/_next/static/chunks/") && originalPathname.endsWith(".js");
  console.log({isStaticChunk})
  if (isStaticChunk) {
    const referer = headers.get("referer");
    console.log({referer})
    if (referer) {
      for (const locale of knownLocales) {
        if (referer.includes(`/${locale}`)) {
          if (originalPathname.endsWith(`.${locale}.js`)) {
            // Already localized, no need to redirect
            return;
          }
          const redirected = request.nextUrl.clone();
          redirected.pathname = originalPathname.replace(/\.js$/, `.${locale}.js`);
          console.log('redirecting to', redirected.pathname)
          return NextResponse.redirect(redirected, 307);
        }
      }
    }
    return; // Let unmatched chunk requests fall through
  }

  // --- 2. Locale extraction and header injection for other requests ---
  const isDev = process.env.NODE_ENV === "development";
  let pathname = originalPathname;

  if (isDev) {
    pathname = removeLocaleFromPathname(pathname);
  }

  const locale = getLocaleFromPathname(pathname) ?? defaultLocale;
  headers.set(localeHeader, locale);

  if (!getLocaleFromPathname(originalPathname)) {
    // Add default locale to path if none is present
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(newUrl, { request: { headers } });
  }

  return NextResponse.next({ request: { headers } });
};

export const config = {
  matcher: ["/_next/static/chunks/:path*", "/((?!_next/static|_next/image).*)"],
};
