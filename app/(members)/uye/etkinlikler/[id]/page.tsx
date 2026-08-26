import Link from "next/link";
import { notFound } from "next/navigation";
import { setRsvp } from "@/app/(members)/_actions/attendance";
import { EventLocation } from "@/app/(members)/uye/EventLocation";
import { SectionHeading } from "@/app/(members)/uye/SectionHeading";
import { requireMember } from "@/lib/auth/dal";
import { eventTypeLabel } from "@/lib/members/event-types";
import { formatDateTime } from "@/lib/members/format";
import {
  getEvent,
  listEventAttendance,
  listMembers,
} from "@/lib/members/queries";
import type { Member, RsvpStatus } from "@/lib/members/types";

const ANSWERS: { value: RsvpStatus; label: string }[] = [
  { value: "going", label: "Geliyorum" },
  { value: "maybe", label: "Belki" },
  { value: "declined", label: "Gelemiyorum" },
];

/**
 * The roll, in the order a club reads it: who is coming, who might, who
 * cannot, and — last, because it is the column the board acts on — who has not
 * said. Silence is a column rather than an absence: a name missing from all
 * three answers is invisible, and "nobody has asked me" is the commonest
 * reason for it.
 */
const GROUPS: { rsvp: RsvpStatus | null; label: string }[] = [
  { rsvp: "going", label: "Geliyor" },
  { rsvp: "maybe", label: "Belki" },
  { rsvp: "declined", label: "Gelemiyor" },
  { rsvp: null, label: "Yanıt yok" },
];

export default async function EtkinlikPage({
  params,
}: PageProps<"/uye/etkinlikler/[id]">) {
  const member = await requireMember();
  const { id } = await params;

  const event = await getEvent(id);
  // Missing, or hidden by RLS from someone who should not have it — the same
  // answer either way, since telling them apart would confirm it exists.
  if (!event) notFound();

  const [attendance, everyone] = await Promise.all([
    listEventAttendance(event.id),
    listMembers(),
  ]);

  // Deactivated members are not expected anywhere, so they are not owed a row
  // in the roll and would otherwise sit in "Yanıt yok" forever.
  const roster = everyone.filter((m) => m.is_active);
  const answers = new Map(attendance.map((a) => [a.member_id, a.rsvp ?? null]));

  const roll = GROUPS.map((group) => ({
    ...group,
    members: roster.filter(
      (m) => (answers.get(m.id) ?? null) === group.rsvp,
    ) as Member[],
  }));

  const mine = answers.get(member.id) ?? null;
  const going = roll[0].members.length;
  const board = member.role === "board";

  return (
    <>
      <SectionHeading
        label="Etkinlik"
        title={event.title}
        meta={formatDateTime(event.starts_at)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow text-primary">{eventTypeLabel(event.type)}</p>
        {board && (
          <>
            <span aria-hidden className="h-3 w-px bg-foreground/20" />
            <Link
              href={`/uye/etkinlikler/${event.id}/duzenle`}
              className="eyebrow text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Düzenle
            </Link>
          </>
        )}
      </div>

      <EventLocation
        location={event.location}
        mapUrl={event.map_url}
        className="mt-4 text-sm font-light text-foreground/60"
      />

      {event.description && (
        <p className="mt-6 max-w-2xl whitespace-pre-line text-sm font-light leading-relaxed text-foreground/70">
          {event.description}
        </p>
      )}

      {/* The same plain form the list uses: three submits, no client
          JavaScript, so answering works before the page has hydrated. */}
      <form action={setRsvp} className="mt-8 flex flex-wrap items-center gap-2">
        <input type="hidden" name="eventId" value={event.id} />
        {ANSWERS.map(({ value, label }) => (
          <button
            key={value}
            type="submit"
            name="rsvp"
            value={value}
            aria-pressed={mine === value}
            className={`eyebrow border px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
              mine === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/20 text-foreground/60 hover:border-primary hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </form>

      <section aria-labelledby="katilim" className="mt-16">
        <div className="flex items-end justify-between gap-3 border-b-2 border-foreground pb-4">
          <h2 id="katilim" className="eyebrow text-primary">
            Katılım
          </h2>
          <p className="eyebrow tabular-nums text-foreground/45">
            {going} / {roster.length}
          </p>
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {roll.map((group) => (
            <div key={group.label}>
              <h3 className="eyebrow flex items-baseline justify-between gap-2 border-b border-foreground/15 pb-2">
                <span
                  className={
                    group.rsvp === "going"
                      ? "text-primary"
                      : "text-foreground/50"
                  }
                >
                  {group.label}
                </span>
                <span className="tabular-nums text-foreground/35">
                  {group.members.length}
                </span>
              </h3>

              {group.members.length === 0 ? (
                <p aria-hidden className="mt-4 text-sm text-foreground/25">
                  —
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-2">
                  {group.members.map((m) => (
                    <li
                      key={m.id}
                      className="text-sm font-light text-foreground/70"
                    >
                      {m.full_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
