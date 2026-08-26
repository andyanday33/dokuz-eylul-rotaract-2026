import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import type { Member } from "@/lib/members/types";
import { createClient } from "@/lib/supabase/server";

/**
 * The membership gate.
 *
 * `proxy.ts` only checks that a token is validly signed, which it must — it
 * runs on prefetches, so it cannot afford a database lookup. That check says
 * nothing about whether the signed-in person is *still* in the club: a session
 * outlives the row it was issued against, so someone the board deactivates
 * goes on holding a perfectly good JWT until it expires.
 *
 * The `members` row is what membership actually means, so every page and
 * action under `/uye` calls one of these first, even the read-only ones. RLS
 * is the backstop underneath, not the gate.
 */

/**
 * The signed-in member, or null for a signed-out visitor or for someone the
 * board has deactivated — `members_read` is gated on `is_member()`, which
 * requires `is_active`, so a deactivated member cannot read even their own
 * row. The two are indistinguishable here, and mean the same thing: not a
 * member. The `is_active` check below is the same rule said twice, in case
 * that policy is ever loosened.
 *
 * `cache` dedupes this across a single render, so a page and the three
 * components inside it can each ask without three round-trips.
 */
export const getMember = cache(async (): Promise<Member | null> => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Member>();

  return member?.is_active ? member : null;
});

/** Whether anyone is signed in at all, regardless of club membership. */
export const getSignedInEmail = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.email ?? null;
});

export const requireMember = cache(async (): Promise<Member> => {
  const member = await getMember();
  // `/giris` decides what to show: the sign-in form for a stranger, or the
  // "not a member" notice for someone holding a valid session without a row.
  if (!member) redirect("/giris");
  return member;
});

export const requireBoard = cache(async (): Promise<Member> => {
  const member = await requireMember();
  if (member.role !== "board") redirect("/uye");
  return member;
});
