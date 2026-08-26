import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publishableKey, supabaseUrl } from "./env";

/** The members half's own front door: reachable without a session. */
const OPEN_PATHS = ["/giris", "/auth"];

const isOpen = (pathname: string) =>
  OPEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/**
 * Keeps the auth cookies fresh on the private half of the site, and turns
 * signed-out visitors around at the door.
 *
 * This is an *optimistic* check and deliberately shallow. Proxy runs on every
 * matched request including link prefetches, so it verifies the token's
 * signature and nothing else — no database, no membership lookup. Whether the
 * signed-in person is actually in the club is decided in `lib/auth/dal.ts`,
 * next to the queries, which is the only check that can be trusted.
 */
export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), publishableKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // Marks the response uncacheable. Without these a CDN could hand one
        // member's rotated token to whoever asks next.
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // Verifies the JWT against the cached JWKS rather than asking the Auth
  // server, which is what makes it cheap enough to run on every navigation.
  // Calling it is also what triggers the refresh that populates `setAll`.
  const { data } = await supabase.auth.getClaims();

  if (data?.claims || isOpen(request.nextUrl.pathname)) return response;

  const url = request.nextUrl.clone();
  url.pathname = "/giris";
  url.search = "";

  const redirect = NextResponse.redirect(url);
  // The refresh above may have rotated the auth cookies onto `response`, which
  // is now being thrown away. Carry them over, or an expiring session is
  // logged out by the very redirect meant to send it to the login page.
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
};
