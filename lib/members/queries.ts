import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Announcement, Attendance, ClubEvent, Member } from "./types";

/**
 * Reads for the members area.
 *
 * Every one of these runs as the signed-in member, so RLS has already decided
 * what comes back — drafts stay with the board, and a signed-out request gets
 * nothing. None of that is re-implemented here; these only choose ordering and
 * how much to fetch.
 */

export const listAnnouncements = async (limit?: number) => {
  const supabase = await createClient();
  const query = supabase
    .from("announcements")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: true });

  const { data } = await (limit ? query.limit(limit) : query).returns<
    Announcement[]
  >();
  return data ?? [];
};

export const listMembers = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*")
    // The board first, then everyone alphabetically. `tr` collation so that
    // Ç, Ğ, İ, Ö, Ş and Ü sort where a Turkish reader expects them.
    .order("role", { ascending: false })
    .order("full_name")
    .returns<Member[]>();

  return (data ?? []).sort((a, b) =>
    a.role === b.role
      ? a.full_name.localeCompare(b.full_name, "tr")
      : a.role === "board"
        ? -1
        : 1,
  );
};

export const listUpcomingEvents = async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .returns<ClubEvent[]>();
  return data ?? [];
};

export const listPastEvents = async (limit = 10) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .lt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: false })
    .limit(limit)
    .returns<ClubEvent[]>();
  return data ?? [];
};

/** The signed-in member's own answers, keyed by event for easy lookup. */
export const listMyAttendance = async (memberId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("member_id", memberId)
    .returns<Attendance[]>();

  return new Map((data ?? []).map((row) => [row.event_id, row]));
};

/** How many people said they were coming, per event. */
export const countGoing = async (eventIds: string[]) => {
  if (eventIds.length === 0) return new Map<string, number>();

  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("event_id")
    .in("event_id", eventIds)
    .eq("rsvp", "going")
    .returns<{ event_id: string }[]>();

  const counts = new Map<string, number>();
  for (const { event_id } of data ?? [])
    counts.set(event_id, (counts.get(event_id) ?? 0) + 1);
  return counts;
};

/** One event, or null — including when RLS decides the reader is nobody. */
export const getEvent = async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle<ClubEvent>();
  return data;
};

/**
 * Everyone's answer for one event.
 *
 * The whole club may read this — `attendance_read` has said so since 0001, and
 * the counts on the list page already lean on it. Who is coming to a club
 * meeting is not a secret from the club.
 */
export const listEventAttendance = async (eventId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("event_id", eventId)
    .returns<Attendance[]>();
  return data ?? [];
};
