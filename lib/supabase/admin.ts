import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { secretKey, supabaseUrl } from "./env";

/**
 * The service-role client. Bypasses RLS entirely, so it exists for exactly one
 * job: issuing invitations, which needs to reach the Auth admin API and to
 * write a `members` row for someone who cannot yet write one for themselves.
 *
 * Never import this from a Client Component, and never hand it a value that
 * came from a request without checking `requireBoard()` first — inside this
 * client there are no policies left to catch a mistake.
 *
 * `server-only` above turns a stray client import into a build error rather
 * than a leaked key.
 */
export const createAdminClient = () =>
  createSupabaseClient(supabaseUrl(), secretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
