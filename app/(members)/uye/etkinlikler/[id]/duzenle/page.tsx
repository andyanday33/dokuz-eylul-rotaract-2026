import { notFound } from "next/navigation";
import { SectionHeading } from "@/app/(members)/uye/SectionHeading";
import { requireBoard } from "@/lib/auth/dal";
import { formatDateTime } from "@/lib/members/format";
import { getEvent } from "@/lib/members/queries";
import { EditEventForm } from "./EditEventForm";

/**
 * Board-only. `requireBoard()` turns an ordinary member back at the door, and
 * `updateEvent` checks again for itself — reaching this page is not what makes
 * the save allowed.
 */
export default async function EtkinlikDuzenlePage({
  params,
}: PageProps<"/uye/etkinlikler/[id]/duzenle">) {
  await requireBoard();
  const { id } = await params;

  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <>
      <SectionHeading
        label="Etkinliği düzenle"
        title={event.title}
        meta={formatDateTime(event.starts_at)}
        intro="Kaydedilen değişiklikler üyelere hemen görünür. Verilen katılım yanıtları olduğu gibi kalır."
      />

      <EditEventForm event={event} />
    </>
  );
}
