import "server-only";

import { headers } from "next/headers";

/**
 * The origin to send people back to after an email link. These have to be
 * absolute URLs, and they have to match what is registered in Supabase's
 * redirect allow-list.
 *
 * Derived from the request by default so that localhost, preview deployments
 * and production each send links back to themselves. `NEXT_PUBLIC_SITE_URL`
 * overrides it for the case where the app sits behind a proxy that rewrites
 * the host into something the browser never sees.
 */
export const siteUrl = async () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
};

/**
 * Keeps a `?next=` parameter from becoming an open redirect. Anything that is
 * not a plain in-site path — an absolute URL, or `//evil.com`, which browsers
 * read as protocol-relative — falls back to the members' front page.
 */
export const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/uye";
