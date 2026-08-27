# Dokuz Eylül Rotaract Kulübü

The club's website. Three parts, deliberately separate:

- **The public site**, under `app/(site)/[lang]`, in Turkish and English.
- **The CMS**, at `/admin`. Payload, holding the content that changes without
  the site changing — the roll of presidents, the board, the committee chairs,
  the seven areas of focus.
- **The members area**, under `app/(members)`, Turkish only and outside the
  locale segment: `/giris` to sign in, `/uye` and below once you are in. It is
  backed by Supabase and needs the setup described further down.

The CMS and the members area share one Postgres and nothing else. Payload keeps
its tables in a `payload` schema; the members area's live in `public` under
hand-written SQL, RLS policies and column grants. Neither can migrate over the
other, and no editor account reaches `/uye`.

Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, GSAP, Payload 3.
Node 20.9+.

## Running the public site

```bash
npm install
cp .env.example .env  # DATABASE_URL and PAYLOAD_SECRET are the two it needs
npm run dev           # http://localhost:3000 → redirects to /tr or /en
```

`/` negotiates a locale from the `NEXT_LOCALE` cookie, then `Accept-Language`,
then falls back to Turkish. See `proxy.ts`.

Copy lives in two places, and which one is the point of the page builder.

**Section content belongs to the page.** A section that has been moved carries
its own words — and its own images — on the page document that uses it, so the
same section can appear twice on the site saying two different things. `hero`,
`marquee`, `about`, `numbers` and `four-way-test` have moved; the other six are
on their way, one at a time.

**Chrome and unmoved sections read the dictionaries.** `i18n/dictionaries/tr.json`
and `en.json` hold the navbar, the footer, and every section whose copy has not
moved yet. Turkish is the source of truth for the shape: a key present there and
missing from English is a type error, not a blank on the page.

**Facts about people** — who holds a seat, who served which term — live in
their own collections, because they change on their own schedule and are the
same wherever they appear.

## The CMS

`/admin`, backed by the `payload` schema of the same Supabase Postgres as the
members area. Four collections carry the public site, plus uploads and the
editor accounts themselves:

| Collection | Feeds |
| --- | --- |
| Pages | every public page, assembled from the sections below |
| Presidents | the roll on the home page and all of `/[lang]/presidents` |
| Board members | the wheel |
| Committee chairs | the accordion below it |
| Areas of focus | the seven-item index, in both languages |

### The page builder

`cms/blocks/index.ts` is the ordered list of sections a page can be built from
— the site's own components, offered as a menu. Two things are checked against
it: `components/blocks/registry.tsx` maps every slug to what renders it, as a
`Record` keyed on the slug union, so a block without a component is a compile
error; and the `layout` field on `pages` offers exactly that list.

The home page is a page document like any other, at the reserved path `home`.
It answers at `/tr` and `/en`; the catch-all refuses `/tr/home` so one page does
not get two addresses. **Do not delete or rename it** — the site's root 404s
without it, deliberately, rather than falling back to something that looks
nearly right.

A block with no fields is not unfinished. It is a section whose content has not
moved yet: it still reads the dictionary as it always did, and the builder
decides only whether it appears and where. Moving one means adding fields in
`cms/blocks/`, changing the component to take them as a prop, adding them to
`scripts/seed-data.json`, and deleting the dictionary keys — in that order, so
the compiler finds every reader of the old copy for you.

### Setting it up

1. **`DATABASE_URL`.** Supabase → **Connect** → **Session pooler**, port 5432.
   Not the transaction pooler on 6543: Drizzle uses prepared statements, which
   it does not support. This project has no direct-connection host.
2. **`PAYLOAD_SECRET`.** Any long unguessable string; it signs the editor
   cookie. Changing it signs everyone out of `/admin`.
3. **The schema.** Run `supabase/migrations/0004_payload_schema.sql` — one
   `create schema` statement. Payload creates the tables inside it itself.
4. **The tables.** `npm run cms:migrate`. There is no shortcut for a fresh
   database — `push` is off, for the reasons under **Working on it** below.
5. **The content.** `npm run cms:seed` writes the roll, both role lists and the
   areas of focus, and uploads the portraits out of `public/`. It matches on
   identity — a term, a role, a key, a filename — so running it again creates
   nothing and overwrites no edit.
6. **The first editor.** Open `/admin`; an empty `editors` collection offers to
   create one. After that, editors invite each other from the panel.

Do **not** add `payload` to Supabase's exposed schemas. The site reads Payload
through Payload, and exposing it would put editor accounts and password hashes
behind the publishable key.

### Working on it

```bash
npm run cms:types       # regenerate cms/payload-types.ts after a field change
npm run cms:importmap   # regenerate the admin import map after a custom component
npm run cms:migrate:create   # a migration for a schema change
npm run cms:migrate          # apply pending migrations
```

**`push` is off** (`payload.config.ts`), so a new field does not appear just by
restarting dev. The loop is: add the field, `cms:migrate:create`, `cms:migrate`.

That is not the usual Payload setup, and the reason is this project's: one
database, shared by dev and production. `push` diffs the config against the
database on startup and applies whatever is missing — fine when development has
its own database, but here it is a live schema change nobody recorded, after
which `migrate:create` finds nothing to describe and writes an empty migration.
The change is live and will never reach a deploy. It also runs on *every*
Payload init, not just `next dev`: `migrate:create` pushed the very tables it
was about to write a migration for, and the migration then failed with
"relation already exists".

Two more things that will otherwise cost you an afternoon:

- **`npm run cms:migrate` prompts, and a pipe hides the prompt.** Once a
  database has been touched by `push` — this one has — Payload asks "data loss
  will occur, proceed?" before every migration. Piped through `tail` or a log
  file it looks like a hang; it is waiting on stdin.
- **Do one thing per migration.** Dropping a block's table in the same step as
  adding another block's localised table makes Drizzle ask, interactively,
  whether the new table is a rename of the old one — a prompt with no sane
  non-interactive answer. Removing `sliding-text` and giving `hero` its fields
  were therefore generated and applied as two migrations, which is also the
  history you want to read back later.

Two conventions worth knowing before adding a collection:

- **A role is a key, not a title.** `cms/roles.ts` holds the board's five seats,
  the seven committees and the seven areas of focus; the translated titles stay
  in the dictionaries, joined by that key. The lists are typed against the
  dictionary, so renaming a key there breaks the build rather than the page.
  Adding a seat is a code change in both places — deliberately, since it needs
  a translation before it can render at all.
- **Reads go through `lib/cms/queries.ts`.** The Local API, not `fetch` against
  Payload's own REST routes, and returning the site's shapes rather than
  Payload's — a portrait is a URL string by the time a component sees it.
  Each query is memoised per request, so two sections asking for the roll is
  one query. Writes revalidate the affected paths from a collection hook, so an
  edit lands on the site without a deploy.

## Setting up the members area

Everything in this section is only needed if you are working on `/uye`. The
public site and `next build` both run without the Supabase *keys* — they are
read when a client is constructed, not when the module is imported, so the
failure lands on the first members request rather than at startup. They do
need `DATABASE_URL`, since the public pages are rendered ahead of time and
read their content out of Payload while they are.

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
app/(payload)/         the admin panel and Payload's API — generated, not edited
app/auth/confirm/      where invitation links land
payload.config.ts      collections, localisation, the Postgres adapter
cms/collections/       one file per collection
cms/roles.ts           the fixed role keys, typed against the dictionaries
cms/hooks/             revalidation
lib/cms/               the Payload client and the site's reads
lib/presidents.ts      the arithmetic of a Rotary year
lib/auth/dal.ts        getMember / requireMember / requireBoard
lib/supabase/          server, admin (service role) and session clients
lib/members/           row types and the reads behind each page
supabase/migrations/   schema, grants and RLS policies
scripts/               bootstrap-board.mjs, signin-link.mjs, seed-cms.ts
i18n/                  locale config and the two dictionaries
components/            public-site sections
proxy.ts               locale negotiation, session refresh under /uye,
                       and a pass-through for /admin and /api
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

Two things the CMS adds:

- **Run `npm run cms:migrate` before the build.** The build reads content, so
  the tables have to exist by then. `push` is a development convenience and is
  off in production.
- **Uploads need somewhere to live.** `cms/collections/Media.ts` writes to
  `media/` on local disk, which a serverless host discards between
  invocations. Before deploying there, add `@payloadcms/storage-s3` and point
  it at Supabase Storage's S3 endpoint; nothing else in that collection
  changes.
