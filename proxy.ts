import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "@/i18n/config";
import { updateSession } from "@/lib/supabase/session";

/**
 * Parses an `Accept-Language` header into tags ordered by quality, best first.
 * Hand-rolled rather than pulled from a package: two locales matched on their
 * primary subtag does not justify a dependency.
 */
const preferredTags = (header: string | null): string[] =>
  (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.toLowerCase(), q: q === undefined ? 1 : Number(q) };
    })
    .filter(({ tag, q }) => tag && !Number.isNaN(q) && q > 0)
    .sort((a, b) => b.q - a.q)
    .map(({ tag }) => tag);

/** An explicit choice wins; otherwise fall back to the browser's preference. */
const negotiate = (request: NextRequest): Locale => {
  const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(remembered)) return remembered;

  for (const tag of preferredTags(request.headers.get("accept-language"))) {
    const match = LOCALES.find((locale) => tag.split("-")[0] === locale);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
};

/** The private half of the site: no locale segment, session cookies instead. */
const MEMBERS_PATHS = ["/uye", "/giris", "/auth"];

const isMembersPath = (pathname: string) =>
  MEMBERS_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The members area is Turkish-only and deliberately outside `/[lang]`, so it
  // wants the opposite of locale negotiation: left alone by the redirect below,
  // and handed its auth cookies instead. Without this branch `/uye` would be
  // sent to `/tr/uye`, which does not exist.
  if (isMembersPath(pathname)) return updateSession(request);

  if (isLocale(pathname.split("/")[1])) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${negotiate(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals and files served straight from `public/`.
  matcher: ["/((?!_next|.*\\.).*)"],
};
