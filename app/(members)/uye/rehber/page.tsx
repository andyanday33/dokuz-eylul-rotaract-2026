import { requireMember } from "@/lib/auth/dal";
import { listMembers } from "@/lib/members/queries";
import { Empty, SectionHeading } from "../SectionHeading";

export default async function RehberPage() {
  await requireMember();
  const members = await listMembers();

  return (
    <>
      <SectionHeading
        label="Rehber"
        title="Kulüp üyeleri"
        meta={`${members.length} kişi`}
        intro="Bu sayfa yalnızca üyelere açık. Buradaki iletişim bilgilerini kulüp dışına taşıma."
      />

      {members.length === 0 ? (
        <Empty>Rehber henüz boş.</Empty>
      ) : (
        <ul className="grid gap-px border border-foreground/10 bg-foreground/10 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li key={m.id} className="bg-paper p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-editorial text-xl italic leading-tight">
                  {m.full_name}
                </h2>
                {m.role === "board" && (
                  <span className="eyebrow shrink-0 text-primary">YK</span>
                )}
              </div>

              {(m.title || m.committee) && (
                <p className="eyebrow mt-2 text-foreground/45">
                  {m.title ?? m.committee}
                </p>
              )}

              <dl className="mt-4 space-y-1 text-sm font-light text-foreground/65">
                <div>
                  <dt className="sr-only">E-posta</dt>
                  <dd>
                    <a
                      href={`mailto:${m.email}`}
                      className="transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {m.email}
                    </a>
                  </dd>
                </div>
                {m.phone && (
                  <div>
                    <dt className="sr-only">Telefon</dt>
                    <dd>
                      <a
                        href={`tel:${m.phone.replace(/\s/g, "")}`}
                        className="tabular-nums transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {m.phone}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
