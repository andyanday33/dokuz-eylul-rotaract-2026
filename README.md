# Dokuz Eylül Rotaract Kulübü

The club's website. Two halves, deliberately separate:

- **The public site**, under `app/(site)/[lang]`, in Turkish and English. It
  talks to no database and needs no configuration — `npm run dev` is enough.
- **The members area**, under `app/(members)`, Turkish only and outside the
  locale segment: `/giris` to sign in, `/uye` and below once you are in. It is
  backed by Supabase and needs the setup described further down.

Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, GSAP. Node 20.9+.

## Running the public site

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /tr or /en
```

`/` negotiates a locale from the `NEXT_LOCALE` cookie, then `Accept-Language`,
then falls back to Turkish. See `proxy.ts`.

Copy is not in the components — it lives in `i18n/dictionaries/tr.json` and
`en.json`. Turkish is the source of truth for the shape: a key present there
and missing from English is a type error, not a blank on the page.

## Setting up the members area

Everything in this section is only needed if you are working on `/uye`.
`next build` and the public site both run fine without a Supabase project —
the environment variables are read when a client is constructed, not when the
module is imported, so the failure lands on the first members request rather
than at startup.

### 1. Environment

```bash
cp .env.example .env
```

Fill it from **Project Settings → API** in the Supabase dashboard:

| Variable | Where it comes from | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key | Safe in the browser; RLS is what guards the data |
| `SUPABASE_SECRET_KEY` | Secret key | **Bypasses RLS.** Server only — never prefix it with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | optional | Only when a proxy rewrites the host so auth links cannot be built from the request |

### 2. Schema

Run the files in `supabase/migrations/` in filename order — paste them into
the SQL editor, or `supabase db push` if you have the CLI linked. Each one is
written to survive being run twice, since pasting is easy to do twice.

It creates `members`, `announcements`, `events` and `attendance`, then takes
away the blanket privileges Supabase grants on new tables and hands back only
what an ordinary member may do. Board-only writes are never granted to
`authenticated` at all; they run through the service-role client behind
`requireBoard()`. The file explains why in its header — read that before
changing a grant.

### 3. Auth settings

Under **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` for development.
- **Redirect URLs**: add `http://localhost:3000/auth/**`, and the same for
  every deployed origin.

Two templates under **Authentication → Email Templates** do two different
jobs, and both must be changed from their defaults.

**Magic Link** is what sign-in uses, and it must send a *code*, not a link.
Supabase has no separate OTP template — magic links and codes share one
implementation, and the template variable alone decides which arrives.
`{{ .Token }}` is the six-digit code; `{{ .TokenHash }}` is a link. Replace the
body with something like:

```html
<h2>Dokuz Eylül Rotaract — giriş kodu</h2>
<p>Giriş kodun:</p>
<p style="font-size:28px;letter-spacing:8px;"><strong>{{ .Token }}</strong></p>
<p>Bu kodu sen istemediysen görmezden gel.</p>
```

**Invite user** stays a link, because the point of an invitation is that
somebody who has never signed in can click it. The default links at the Auth
server, which hands the session back in a URL fragment the server never sees,
so it has to be pointed here instead:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">
  Daveti kabul et
</a>
```

Code lifetime is **Authentication → Sign In / Providers → Email → Email OTP
expiration**; an hour is the default and shorter is better for a code somebody
is copying by hand.

If sign-in starts failing for everyone at once, this Magic Link template is the
first thing to check — a reset one sends a link, and nothing is left listening
for it. If invitations break while codes keep working, it is the other one.

#### Custom SMTP is required, not optional

The built-in email service will only deliver **to addresses belonging to the
Supabase organisation's own team members**, and only **two messages per hour**
across the whole project. It exists to test templates. No paid plan changes
either limit — custom SMTP is the only thing that does, and it is not itself a
paid feature.

That makes it a blocker rather than an annoyance here, because email links are
the *only* way into this site: on the built-in service an invitation sent to a
club member simply never arrives. It looks exactly like a member ignoring their
email, which is the worst way for this to fail.

Set up a provider under **Authentication → SMTP Settings** before inviting
anyone who is not on the Supabase team — Resend, Postmark, SES, SendGrid,
Brevo and ZeptoMail all work. Whichever you pick, you have to verify a sending
domain: their test-mode senders have the same restriction Supabase's does, and
will only mail you back.

While developing, skip email entirely:

```bash
npm run signin:link -- ad@ornek.com
```

That mints the same token the email would have carried and prints a
`/auth/confirm` URL instead of sending it, so it costs no quota and works
before the templates are fixed. It needs the secret key, so it only runs from
the repo — and anyone holding the printed link is one click from being signed
in as that member, so don't paste it anywhere shared.

#### Why codes, and why email only

Emailed codes are the only way in — no social provider, no password.
`signInWithOtp` is called with `shouldCreateUser: false`, so a code is only
ever sent to an address the board has already invited, and nobody can mint
themselves an account by typing one into the form. Leave everything under
**Authentication → Providers** disabled.

### 4. The first board member

The invite form at `/uye/yonetim` is behind `requireBoard()`, so it cannot make
the first board member — there has to be one before there can be one. Break the
circle once, from the repo:

```bash
npm run bootstrap:board -- ad@ornek.com "Ad Soyad" "Başkan"
```

The title is optional. The script reads `.env`, creates the auth user and the
`members` row together with `role = 'board'`, and emails an invitation; accept
it and you land on `/uye`. It is safe to re-run — an address that already has
an account is reused rather than duplicated, and an existing ordinary member is
promoted to board rather than inserted twice. Which also makes it the way to
appoint a second board member if the first one is ever locked out.

It needs `SUPABASE_SECRET_KEY`, so it only ever runs on someone's own machine.
Nothing in the deployed app can call it.

From then on the board invites everyone else from `/uye/yonetim` → **Davet
gönder**, which does the same two writes behind `requireBoard()` — and deletes
the auth user again if the `members` row fails, so nobody ends up able to sign
in and see nothing.

## Layout

```
app/(site)/[lang]/     public site, localised
app/(members)/         /giris and /uye/** — Turkish only, session-gated
  _actions/            server actions; each one re-checks who is calling
app/auth/confirm/      where invitation links land
lib/auth/dal.ts        getMember / requireMember / requireBoard
lib/supabase/          server, admin (service role) and session clients
lib/members/           row types and the reads behind each page
supabase/migrations/   schema, grants and RLS policies
scripts/               bootstrap-board.mjs, signin-link.mjs — dev tooling
i18n/                  locale config and the two dictionaries
components/            public-site sections
proxy.ts               locale negotiation, and session refresh under /uye
```

Two things worth knowing before editing the members area:

- **Membership is the `members` row, not the session.** `proxy.ts` only checks
  that a token is validly signed — it runs on prefetches and cannot afford a
  database lookup. Every page and action under `/uye` therefore calls
  `requireMember()` or `requireBoard()` for itself. `cache()` dedupes that to
  one lookup per request, so saying it repeatedly is free.
- **RLS is the backstop, not the gate.** Hiding a link or a form is
  presentation. The gate is the guard at the top of the page or action, and
  the policy underneath it.

## Deploying

Set the same environment variables on the host, add the deployed origin to
Supabase's redirect allow-list, and update the Site URL. `NEXT_PUBLIC_SITE_URL`
is only needed where the incoming host header is not what the browser used.
