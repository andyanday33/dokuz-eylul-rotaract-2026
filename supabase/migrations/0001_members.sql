-- Members area: identity, announcements, events, attendance.
--
-- The privilege model, in one rule:
--
--   `authenticated` is granted exactly what an ordinary member may do, and
--   nothing more. Board-only mutations are never granted to `authenticated`
--   at all — they run in server actions behind `requireBoard()` using the
--   service-role client (see lib/auth/dal.ts, lib/supabase/admin.ts).
--
-- That is stricter than policing board writes with a policy. Postgres RLS
-- cannot compare a row's old and new values, so a blanket `update` grant plus
-- a `using (id = auth.uid())` policy would let any member set their own
-- `role` to 'board'. Column-level grants close that off at the SQL layer,
-- where a stolen publishable key cannot even attempt the write.

create type public.member_role as enum ('member', 'board');
create type public.rsvp_status as enum ('going', 'maybe', 'declined');

-- One row per person the club has admitted. Its existence *is* membership:
-- an auth.users row without one is nobody, and a session outlives the row it
-- was issued against, so the row is what every request checks.
create table public.members (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text not null,
  email      text not null,
  phone      text,
  role       public.member_role not null default 'member',
  title      text,                      -- board position, e.g. 'Başkan'
  committee  text,
  is_active  boolean not null default true,
  joined_at  date,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  author_id    uuid not null references public.members(id),
  published_at timestamptz,             -- null = draft, board-only
  created_at   timestamptz not null default now()
);

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  created_by  uuid not null references public.members(id),
  created_at  timestamptz not null default now()
);

-- `rsvp` is the member's intention, `attended` the board's record of what
-- happened. Two columns rather than one status enum so that a column-level
-- grant can hand out the first without the second.
create table public.attendance (
  event_id   uuid not null references public.events  on delete cascade,
  member_id  uuid not null references public.members on delete cascade,
  rsvp       public.rsvp_status,
  attended   boolean,
  updated_at timestamptz not null default now(),
  primary key (event_id, member_id)
);

create index announcements_published_idx on public.announcements (published_at desc nulls last);
create index events_starts_at_idx        on public.events (starts_at desc);
create index attendance_member_idx       on public.attendance (member_id);

-- ---------------------------------------------------------------------------
-- Role helpers
--
-- `security definer` is load-bearing, not decoration: a policy *on* members
-- that queries members inline recurses and fails at runtime. Running as the
-- owner skips RLS on the inner read and breaks the cycle.
-- `set search_path = ''` forces every name below to be schema-qualified, so a
-- caller cannot shadow `members` with something of their own.
-- ---------------------------------------------------------------------------

create function public.is_member() returns boolean
  language sql stable security definer set search_path = '' as $$
    select exists (
      select 1 from public.members
      where id = (select auth.uid()) and is_active
    );
  $$;

create function public.is_board() returns boolean
  language sql stable security definer set search_path = '' as $$
    select exists (
      select 1 from public.members
      where id = (select auth.uid()) and is_active and role = 'board'
    );
  $$;

-- ---------------------------------------------------------------------------
-- Grants: start from nothing.
-- Supabase hands anon and authenticated blanket privileges on new tables in
-- public by default, so the deny-by-default posture has to be taken back
-- explicitly before it can be granted piece by piece.
-- ---------------------------------------------------------------------------

revoke all on public.members, public.announcements, public.events, public.attendance
  from anon, authenticated;

-- anon is granted nothing at all: the public site never queries these tables.

grant select                            on public.members       to authenticated;
grant update (full_name, phone)         on public.members       to authenticated;
grant select                            on public.announcements to authenticated;
grant select                            on public.events        to authenticated;
grant select                            on public.attendance    to authenticated;
grant insert (event_id, member_id, rsvp) on public.attendance   to authenticated;
-- The key columns are included because an upsert's ON CONFLICT DO UPDATE
-- writes back every column it was given. Harmless: the policy below still
-- pins member_id to auth.uid(), and `attended` stays ungranted, which is the
-- column the split exists to protect.
grant update (rsvp, event_id, member_id) on public.attendance   to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.members       enable row level security;
alter table public.announcements enable row level security;
alter table public.events        enable row level security;
alter table public.attendance    enable row level security;

-- The directory is visible to the club, and to nobody else.
create policy members_read on public.members
  for select to authenticated using ((select public.is_member()));

create policy members_update_own on public.members
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Drafts stay with the board until they are published.
create policy announcements_read on public.announcements
  for select to authenticated
  using (
    (select public.is_member())
    and (published_at is not null or (select public.is_board()))
  );

create policy events_read on public.events
  for select to authenticated using ((select public.is_member()));

create policy attendance_read on public.attendance
  for select to authenticated using ((select public.is_member()));

create policy attendance_rsvp_own on public.attendance
  for insert to authenticated
  with check (member_id = (select auth.uid()) and (select public.is_member()));

create policy attendance_update_own on public.attendance
  for update to authenticated
  using (member_id = (select auth.uid()))
  with check (member_id = (select auth.uid()));

-- Keeps `updated_at` honest without trusting the client to send it.
create function public.touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$
    begin
      new.updated_at = now();
      return new;
    end;
  $$;

create trigger attendance_touch before update on public.attendance
  for each row execute function public.touch_updated_at();
