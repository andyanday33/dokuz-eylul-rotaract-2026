-- What kind of event an event is.
--
-- `text` with a check constraint rather than an enum, which is a deliberate
-- break from `member_role` and `rsvp_status` above it. Those two are closed
-- sets — a person is a member or on the board; an answer is yes, maybe or no.
-- This one is a taxonomy the club will revise as it works out what it actually
-- runs, and Postgres cannot drop or rename an enum value without recreating
-- the type and rewriting every column that uses it. Editing a check constraint
-- is one statement.
--
-- No index: this table holds a season's worth of rows, so every read of it is
-- a sequential scan whatever we do, and nothing filters on type yet anyway.
--
-- Safe to run twice — the members area is deployed by pasting these files into
-- the SQL editor, where it is easy to paste one a second time.

alter table public.events
  add column if not exists type text not null default 'toplanti';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'events_type_check'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
      add constraint events_type_check
      check (type in ('toplanti', 'proje', 'sosyal', 'egitim', 'bolge'));
  end if;
end $$;

-- The default existed to backfill rows written before this column did. Keeping
-- it would mean an insert that forgets the type silently becomes a meeting,
-- which is worse than failing: a miscategorised event looks correct. The form
-- always sends one, so from here the column is genuinely required.
alter table public.events alter column type drop default;

-- No new grant. `grant select on public.events to authenticated` in 0001 is
-- table-level, so it already covers columns added later — unlike the
-- column-level grants on `attendance`, which would each need extending.
