-- Where the event is, as a link.
--
-- Separate from `location`, which stays the human sentence a member reads
-- ("Alsancak, Kıbrıs Şehitleri Caddesi"). This is the pin behind it. Keeping
-- them apart means an event can have an address with no link, which is the
-- common case, and that the list still reads as prose when nobody pasted one.
--
-- Nullable with no default: most events will not carry one, and an empty
-- string would be a second way of saying null.
--
-- `text`, not a stricter type — Postgres has no URL type, and the check that
-- matters is the scheme, done in `createEvent` before this is ever rendered
-- into an href. A constraint here would only repeat it later and worse.
--
-- Safe to run twice.

alter table public.events
  add column if not exists map_url text;
