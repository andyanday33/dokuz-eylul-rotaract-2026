/**
 * Supabase connection details, read loudly but late.
 *
 * Loudly: a missing key otherwise surfaces as an opaque "Invalid API key" from
 * the network layer, several redirects into a sign-in attempt. Failing with
 * the variable's own name costs nothing and says what is actually wrong.
 *
 * Late: read when a client is built rather than when this module is imported,
 * so that `next build` and anyone working on the public half of the site do
 * not need a Supabase project to exist. The failure then lands on the first
 * request to a members page, which is the only place it matters.
 *
 * The `process.env.X` lookups stay written out in full — Next inlines
 * `NEXT_PUBLIC_*` by matching that literal text, so `process.env[name]` would
 * silently read nothing wherever the value is inlined rather than looked up.
 */
const required = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`${name} is not set — see .env.example`);
  return value;
};

/** Safe to expose: RLS, not obscurity, is what guards the data. */
export const supabaseUrl = () =>
  required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");

export const publishableKey = () =>
  required(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );

/** Bypasses RLS entirely — server-side callers only, never sent anywhere. */
export const secretKey = () =>
  required(process.env.SUPABASE_SECRET_KEY, "SUPABASE_SECRET_KEY");
