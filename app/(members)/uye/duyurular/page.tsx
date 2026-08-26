import { requireMember } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/members/format";
import { listAnnouncements } from "@/lib/members/queries";
import { DeleteDialog } from "../DeleteDialog";
import { Empty, SectionHeading } from "../SectionHeading";

export default async function DuyurularPage() {
  const member = await requireMember();
  const announcements = await listAnnouncements();
  const board = member.role === "board";

  return (
    <>
      <SectionHeading
        label="Duyurular"
        title="Kulüpten haberler"
        meta={`${announcements.length}`}
        intro={
          member.role === "board"
            ? "Taslaklar yalnızca yönetim kuruluna görünür."
            : undefined
        }
      />

      {announcements.length === 0 ? (
        <Empty>Henüz duyuru yok.</Empty>
      ) : (
        <ul className="divide-y divide-foreground/10 border-t border-foreground/10">
          {announcements.map((a) => (
            <li key={a.id} className="py-8">
              <div className="flex items-center gap-3">
                <p className="eyebrow tabular-nums text-foreground/40">
                  {a.published_at ? formatDateTime(a.published_at) : "Taslak"}
                </p>
                {!a.published_at && (
                  <span className="eyebrow border border-primary/40 px-2 py-0.5 text-primary">
                    Yayında değil
                  </span>
                )}
                {board && (
                  <div className="ml-auto">
                    <DeleteDialog
                      kind="announcement"
                      id={a.id}
                      title={a.title}
                    />
                  </div>
                )}
              </div>

              <h2 className="font-editorial mt-3 text-2xl italic leading-tight sm:text-3xl">
                {a.title}
              </h2>

              <p className="mt-4 max-w-2xl whitespace-pre-line text-sm font-light leading-relaxed text-foreground/70">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
