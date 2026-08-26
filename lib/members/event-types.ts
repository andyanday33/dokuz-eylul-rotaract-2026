/**
 * The club's event taxonomy: the five kinds of thing a Rotaract club puts on
 * a calendar, in the order a board member is likeliest to reach for them.
 *
 * Kept out of `types.ts` on purpose. That file is a hand-written mirror of the
 * schema and says it can be replaced wholesale by `supabase gen types`, which
 * would take these labels with it. They are UI copy, and they live here.
 *
 * The values match `events_type_check` in 0002_event_type.sql. Adding one is
 * two edits — the constraint and this list.
 */

export const EVENT_TYPES = [
  { value: "toplanti", label: "Toplantı" },
  { value: "proje", label: "Proje" },
  { value: "sosyal", label: "Sosyal" },
  { value: "egitim", label: "Eğitim" },
  { value: "bolge", label: "Bölge" },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]["value"];

const LABELS = new Map<string, string>(
  EVENT_TYPES.map(({ value, label }) => [value, label]),
);

export const isEventType = (value: string): value is EventType =>
  LABELS.has(value);

/**
 * Falls back to the stored value rather than to an empty string: if a row ever
 * carries a type this list has forgotten, showing `bolge` is more use to
 * whoever has to fix it than showing nothing.
 */
export const eventTypeLabel = (value: string) => LABELS.get(value) ?? value;
