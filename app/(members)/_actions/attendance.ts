"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth/dal";
import type { RsvpStatus } from "@/lib/members/types";
import { createClient } from "@/lib/supabase/server";

const STATUSES: RsvpStatus[] = ["going", "maybe", "declined"];

const isStatus = (value: string): value is RsvpStatus =>
  (STATUSES as string[]).includes(value);

/**
 * Records the signed-in member's answer to an event.
 *
 * `member_id` comes from the session, never from the form — otherwise the
 * hidden field would let anyone RSVP on someone else's behalf. The RLS policy
 * says the same thing underneath, but the gate belongs here.
 */
export async function setRsvp(formData: FormData) {
  const member = await requireMember();

  const eventId = String(formData.get("eventId") ?? "");
  const rsvp = String(formData.get("rsvp") ?? "");
  if (!eventId || !isStatus(rsvp)) return;

  const supabase = await createClient();
  await supabase
    .from("attendance")
    .upsert(
      { event_id: eventId, member_id: member.id, rsvp },
      { onConflict: "event_id,member_id" },
    );

  revalidatePath("/uye/etkinlikler");
  revalidatePath("/uye");
}
