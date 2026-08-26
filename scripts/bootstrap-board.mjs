/**
 * Creates the first board member, so that `/uye/yonetim` becomes reachable.
 *
 * Every other account is made from that page. This one cannot be, because the
 * form behind it calls `requireBoard()` — there has to be a board member
 * before there can be a board member. This script is the way out of that, and
 * it should be needed exactly once per project.
 *
 *   npm run bootstrap:board -- ad@ornek.com "Ad Soyad" "Başkan"
 *
 * It does the same two things `inviteMember` does — create the auth user, then
 * the `members` row — using the same service-role key, and rolls the first
 * back if the second fails. It is safe to re-run: an address that is already
 * a member is promoted rather than duplicated, and an existing auth user is
 * reused rather than recreated.
 */

import { createClient } from "@supabase/supabase-js";

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const die = (message) => {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
};

const [emailArg, fullName, title] = process.argv.slice(2);
const email = (emailArg ?? "").trim().toLowerCase();

if (!LOOKS_LIKE_EMAIL.test(email) || !fullName || fullName.trim().length < 2) {
  die(
    'Usage: npm run bootstrap:board -- <email> "<Ad Soyad>" ["Unvan"]\n' +
      '  e.g. npm run bootstrap:board -- ad@ornek.com "Ad Soyad" "Başkan"',
  );
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  die(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set — see .env.example.\n" +
      "  This script reads them from .env; run it through `npm run bootstrap:board`.",
  );
}

// The host, never the key: this prints to a terminal and often into a scroll
// buffer someone else can read.
console.log(`\n  Project: ${new URL(url).host}`);

const admin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Supabase has no get-user-by-email, so page until the address turns up. */
const findAuthUser = async () => {
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) die(`Could not list users: ${error.message}`);

    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) return null;
  }
};

const redirectTo = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "")}/auth/confirm`;

// ---------------------------------------------------------------------------

const { data: existing, error: lookupError } = await admin
  .from("members")
  .select("id, full_name, role, is_active")
  .eq("email", email)
  .maybeSingle();

if (lookupError) {
  die(
    `Could not read the members table: ${lookupError.message}\n` +
      "  If it does not exist yet, apply supabase/migrations/0001_members.sql first.",
  );
}

if (existing) {
  if (existing.role === "board" && existing.is_active) {
    console.log(
      `\n  ✓ ${existing.full_name} <${email}> is already an active board member.` +
        "\n    Nothing to do — sign in at /giris.\n",
    );
    process.exit(0);
  }

  const { error } = await admin
    .from("members")
    .update({ role: "board", is_active: true, ...(title ? { title } : {}) })
    .eq("id", existing.id);
  if (error) die(`Could not promote the existing member: ${error.message}`);

  console.log(
    `\n  ✓ ${existing.full_name} <${email}> promoted to board.` +
      "\n    They already have an account — sign in at /giris.\n",
  );
  process.exit(0);
}

// No members row. Reuse the auth user if there is one, otherwise invite.
let user = await findAuthUser();
let invited = false;

if (user) {
  console.log(`  An auth user already exists for ${email}; reusing it.`);
} else {
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (error || !data.user) {
    die(`Could not send the invitation: ${error?.message ?? "unknown error"}`);
  }
  user = data.user;
  invited = true;
}

const { error: rowError } = await admin.from("members").insert({
  id: user.id,
  full_name: fullName.trim(),
  email,
  role: "board",
  title: title?.trim() || null,
});

if (rowError) {
  // Same rollback as `inviteMember`: an auth user with no members row can sign
  // in and see nothing, which reads as a broken site rather than a failed
  // script. Only undo what this run created.
  if (invited) await admin.auth.admin.deleteUser(user.id);
  die(`Could not create the members row: ${rowError.message}`);
}

console.log(
  `\n  ✓ ${fullName.trim()} <${email}> created as board${title ? ` (${title.trim()})` : ""}.`,
);
console.log(
  invited
    ? `    An invitation was sent. It lands on ${redirectTo}.\n` +
        "    If the link 404s or errors, the Invite user email template still\n" +
        "    points at the Auth server — see README, Auth settings.\n"
    : "    No email sent; the account already existed. Sign in at /giris.\n",
);
