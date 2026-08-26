import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publishableKey, supabaseUrl } from "./env";

/**
 * The request-scoped client. Acts as the signed-in member, so every query it
 * runs is still filtered by RLS — this is not a way around the policies.
 *
 * `cookies()` is async in Next 16, so this is too, and each call reads the
 * current request's cookie store rather than a shared one.
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), publishableKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components render after headers are sent, so writing a
          // cookie here throws. Harmless: `proxy.ts` refreshed the session
          // before this request reached the page, so there is nothing here
          // that has not already been written.
        }
      },
    },
  });
};
