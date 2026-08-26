"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateEvent, type FormState } from "@/app/(members)/_actions/board";
import { EventFields } from "@/app/(members)/uye/EventFields";
import { Result, submit } from "@/app/(members)/uye/FormBits";
import type { ClubEvent } from "@/lib/members/types";

const INITIAL: FormState = { status: "idle" };

/**
 * The same fields the board fills in to add an event, with the event's own
 * values already in them. Staying on the page after saving is deliberate: a
 * correction is rarely the only one, and the confirmation is more use here
 * than on the page you would have been thrown back to.
 */
export function EditEventForm({ event }: { event: ClubEvent }) {
  const [state, action, pending] = useActionState(updateEvent, INITIAL);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-5">
      <input type="hidden" name="id" value={event.id} />

      <EventFields event={event} />

      <Result state={state} />

      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" disabled={pending} className={submit}>
          {pending ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
        </button>
        <Link
          href={`/uye/etkinlikler/${event.id}`}
          className="eyebrow text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Vazgeç
        </Link>
      </div>
    </form>
  );
}
