import Link from "next/link";
import { requireMember } from "@/lib/auth/dal";
import { eventTypeLabel } from "@/lib/members/event-types";
import { formatDateTime } from "@/lib/members/format";
import { listAnnouncements, listUpcomingEvents } from "@/lib/members/queries";
import { EventLocation } from "./EventLocation";
import { Empty, SectionHeading } from "./SectionHeading";

export default async function UyePage() {
  const member = await requireMember();
  const [announcements, events] = await Promise.all([
    listAnnouncements(3),
    listUpcomingEvents(),
  ]);

  const next = events[0];
  // Only the given name: the whole point of the private half is that it can
  // talk to people the way the club does.
  const firstName = member.full_name.split(" ")[0];

  return (
    <>
      <SectionHeading
        label="Panel"
        title={`Merhaba ${firstName}`}
        meta={member.role === "board" ? "Yönetim kurulu" : "Üye"}
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="son-duyurular">
          <h2 id="son-duyurular" className="eyebrow text-foreground/50">
            Son duyurular
          </h2>

          {announcements.length === 0 ? (
            <div className="mt-5">
              <Empty>Henüz duyuru yok.</Empty>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-foreground/10 border-t border-foreground/10">
              {announcements.map((a) => (
                <li key={a.id} className="py-5">
                  <p className="eyebrow tabular-nums text-foreground/40">
                    {a.published_at ? formatDateTime(a.published_at) : "Taslak"}
                  </p>
                  <h3 className="font-editorial mt-2 text-xl italic">
                    {a.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm font-light text-foreground/65">
                    {a.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/uye/duyurular"
            className="eyebrow mt-6 inline-block text-primary hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Hepsi →
          </Link>
        </section>

        <section aria-labelledby="siradaki" className="lg:border-l lg:border-foreground/10 lg:pl-8">
          <h2 id="siradaki" className="eyebrow text-foreground/50">
            Sıradaki etkinlik
          </h2>

          {next ? (
            <div className="mt-5">
              <div className="flex items-center gap-3">
                <p className="eyebrow tabular-nums text-primary">
                  {formatDateTime(next.starts_at)}
                </p>
                <span aria-hidden className="h-3 w-px bg-foreground/20" />
                <p className="eyebrow text-foreground/40">
                  {eventTypeLabel(next.type)}
                </p>
              </div>
              <h3 className="font-editorial mt-2 text-2xl italic leading-tight">
                {next.title}
              </h3>
              <EventLocation location={next.location} mapUrl={next.map_url} />
              <Link
                href="/uye/etkinlikler"
                className="eyebrow mt-6 inline-block text-primary hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Katılım bildir →
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <Empty>Planlanmış etkinlik yok.</Empty>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
