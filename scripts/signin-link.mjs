/**
 * Prints a sign-in link for an existing member, without sending an email.
 *
 * Supabase's built-in email service allows two messages per hour across the
 * whole project, which is not a limit you can raise — only custom SMTP moves
 * it. That is fine in production and useless while developing, where the
 * second attempt of an evening is already too many.
 *
 *   npm run signin:link -- ad@ornek.com
 *
 * `generateLink` mints the same token the email would have carried and hands
 * it back instead of posting it, so this costs no quota. The URL is built here
 * rather than taken from `action_link`, because Supabase's own link goes via
 * the Auth server and returns the session in a URL fragment — invisible to the
 * server, and so useless to this app. Pointing `hashed_token` at
 * `/auth/confirm` is the same flow the emails use once their templates are
 * fixed, which also makes this a way to test that route in isolation.
 *
 * Development only: it needs the secret key, and anyone holding the printed
 * link is one click from being signed in as that member. Do not paste it into
 * anything shared.
 */

import { createClient } from "@supabase/supabase-js";

const die = (message) => {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
};

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  die("Usage: npm run signin:link -- <email>");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  die("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set — see .env.example.");
}

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

const admin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.generateLink({
  type: "magiclink",
  email,
});

if (error) {
  die(
    `${error.message}\n` +
      "  A magic link can only be minted for an address that already has an\n" +
      "  account. To create one, use: npm run bootstrap:board -- …",
  );
}

const tokenHash = data?.properties?.hashed_token;
if (!tokenHash) die("Supabase returned no hashed_token — nothing to build a link from.");

console.log(`\n  Signing in as ${email}. The link is single-use:\n`);
console.log(`  ${site}/auth/confirm?token_hash=${tokenHash}&type=magiclink\n`);
console.log("  No email was sent, so this cost none of the project's quota.\n");
