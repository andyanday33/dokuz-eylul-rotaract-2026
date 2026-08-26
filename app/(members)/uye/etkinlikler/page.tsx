import Link from "next/link";
import { setRsvp } from "@/app/(members)/_actions/attendance";
import { requireMember } from "@/lib/auth/dal";
import {
  EVENT_TYPES,
  eventTypeLabel,
  isEventType,
  type EventType,
} from "@/lib/members/event-types";
import { formatDateTime } from "@/lib/members/format";
import {
  countGoing,
  listMyAttendance,
  listPastEvents,
  listUpcomingEvents,
} from "@/lib/members/queries";
import type { RsvpStatus } from "@/lib/members/types";
import { DeleteDialog } from "../DeleteDialog";
import { EventLocation } from "../EventLocation";
import { Empty, SectionHeading } from "../SectionHeading";

const ANSWERS: { value: RsvpStatus; label: string }[] = [
  { value: "going", label: "Geliyorum" },
  { value: "maybe", label: "Belki" },
  { value: "declined", label: "Gelemiyorum" },
];

const PATH = "/uye/etkinlikler";

/**
 * The kinds of event on the calendar, and how many of each.
 *
 * Always rendered, with every kind listed whether or not anything is scheduled
 * under it. An earlier version hid itself when the calendar held fewer than
 * two kinds, on the theory that one option is not a choice — which made the
 * control impossible to find on a new club's calendar, where everything is a
 * meeting. A filter that appears only once the data happens to be varied
 * enough is a filter nobody knows about. A `0` is also worth reading: it says
 * the club has nothing of that kind coming up.
 *
 * Deliberately not the bordered eyebrow buttons the RSVP row uses further down
 * the page. Two rows of identical controls, one narrowing a list and one
 * committing you to turning up, would be the same shape for opposite stakes.
 *
 * `Tümü` carries no number: the masthead has already given the total, and the
 * reset is not a category.
 */
function TypeIndex({
  counts,
  active,
}: {
  counts: Map<string, number>;
  active: EventType | null;
}) {
  const entry = (current: boolean) =>
    `eyebrow flex items-baseline gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
      current ? "text-primary" : "text-foreground/45 hover:text-foreground"
    }`;

  return (
    <nav
      aria-label="Türe göre süz"
      className="flex flex-wrap items-baseline gap-x-6 gap-y-3 pb-4"
    >
      <Link
        href={PATH}
        aria-current={active === null ? "true" : undefined}
        className={entry(active === null)}
      >
        Tümü
      </Link>

      {EVENT_TYPES.map(({ value, label }) => (
        <Link
          key={value}
          href={`${PATH}?tur=${value}`}
          aria-current={active === value ? "true" : undefined}
          className={entry(active === value)}
        >
          {label}
          <span className="tabular-nums opacity-55">
            {counts.get(value) ?? 0}
          </span>
        </Link>
      ))}
    </nav>
  );
}

export default async function EtkinliklerPage({
  searchParams,
}: PageProps<"/uye/etkinlikler">) {
  const member = await requireMember();

  // A typed-in kind that does not exist reads as "no filter" rather than as a
  // 404: the page still has something to show, and saying so is more use than
  // an error about a query string nobody meant to write.
  const { tur } = await searchParams;
  const active = typeof tur === "string" && isEventType(tur) ? tur : null;

  const [all, past] = await Promise.all([
    listUpcomingEvents(),
    listPastEvents(),
  ]);

  // Counted before filtering, so the index keeps describing the whole calendar
  // rather than collapsing to the one kind already chosen.
  const counts = new Map<string, number>();
  for (const event of all) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
  }

  const upcoming = active ? all.filter((e) => e.type === active) : all;

  const [mine, going] = await Promise.all([
    listMyAttendance(member.id),
    countGoing(upcoming.map((e) => e.id)),
  ]);

  const board = member.role === "board";

  return (
    <>
      <SectionHeading
        label="Etkinlikler"
        title="Toplantılar ve projeler"
        meta={`${all.length} yaklaşan`}
      />

      <TypeIndex counts={counts} active={active} />

      {upcoming.length === 0 ? (
        <Empty>
          {active ? (
            <>
              Bu türde yaklaşan etkinlik yok.{" "}
              <Link
                href={PATH}
                className="text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Tümünü göster
              </Link>
            </>
          ) : (
            "Planlanmış etkinlik yok."
          )}
        </Empty>
      ) : (
        <ul className="divide-y divide-foreground/10 border-t border-foreground/10">
          {upcoming.map((event) => {
            const answer = mine.get(event.id)?.rsvp ?? null;
            const count = going.get(event.id) ?? 0;

            return (
              <li key={event.id} className="py-8">
                {/* When, then what kind — divided by the same hairline the
                    masthead sets between its columns. */}
                <div className="flex items-center gap-3">
                  <p className="eyebrow tabular-nums text-primary">
                    {formatDateTime(event.starts_at)}
                  </p>
                  <span aria-hidden className="h-3 w-px bg-foreground/20" />
                  <p className="eyebrow text-foreground/40">
                    {eventTypeLabel(event.type)}
                  </p>
                  {board && (
                    <div className="ml-auto">
                      <DeleteDialog
                        kind="event"
                        id={event.id}
                        title={event.title}
                      />
                    </div>
                  )}
                </div>

                <h2 className="font-editorial mt-2 text-2xl italic leading-tight sm:text-3xl">
                  <Link
                    href={`${PATH}/${event.id}`}
                    className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    {event.title}
                  </Link>
                </h2>

                <EventLocation
                  location={event.location}
                  mapUrl={event.map_url}
                />

                {event.description && (
                  <p className="mt-4 max-w-2xl whitespace-pre-line text-sm font-light leading-relaxed text-foreground/70">
                    {event.description}
                  </p>
                )}

                {/* A plain form per event: three submit buttons, no client
                    JavaScript, so RSVP works before the page has hydrated. */}
                <form action={setRsvp} className="mt-6 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="eventId" value={event.id} />
                  {ANSWERS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="submit"
                      name="rsvp"
                      value={value}
                      aria-pressed={answer === value}
                      className={`eyebrow border px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                        answer === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-foreground/20 text-foreground/60 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}

                  <span className="eyebrow ml-2 tabular-nums text-foreground/40">
                    {count} kişi geliyor
                  </span>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {past.length > 0 && (
        <section aria-labelledby="gecmis" className="mt-16">
          <h2 id="gecmis" className="eyebrow text-foreground/50">
            Geçmiş
          </h2>
          <ul className="mt-5 divide-y divide-foreground/10 border-t border-foreground/10">
            {past.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
              >
                <Link
                  href={`${PATH}/${event.id}`}
                  className="font-editorial text-lg italic transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {event.title}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="eyebrow text-foreground/35">
                    {eventTypeLabel(event.type)}
                  </span>
                  <span aria-hidden className="h-3 w-px bg-foreground/15" />
                  <span className="eyebrow tabular-nums text-foreground/40">
                    {formatDateTime(event.starts_at)}
                  </span>
                  {board && (
                    <DeleteDialog
                      kind="event"
                      id={event.id}
                      title={event.title}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
