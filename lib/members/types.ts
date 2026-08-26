/**
 * Row shapes for the members-area tables, mirroring the migrations in
 * `supabase/migrations/`.
 *
 * Hand-written rather than generated so the repo has no build-time dependency
 * on a live project. If the schema grows, `supabase gen types typescript`
 * produces the same shapes and can replace this file wholesale.
 */

import type { EventType } from "./event-types";

export type { EventType };

export type MemberRole = "member" | "board";
export type RsvpStatus = "going" | "maybe" | "declined";

export type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: MemberRole;
  title: string | null;
  committee: string | null;
  is_active: boolean;
  joined_at: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  author_id: string;
  published_at: string | null;
  created_at: string;
};

/** `Event` is taken by the DOM, and this is a club meeting, not a DOM event. */
export type ClubEvent = {
  id: string;
  title: string;
  type: EventType;
  description: string | null;
  location: string | null;
  /** A map link for `location`, if the board pasted one. */
  map_url: string | null;
  starts_at: string;
  ends_at: string | null;
  created_by: string;
  created_at: string;
};

export type Attendance = {
  event_id: string;
  member_id: string;
  rsvp: RsvpStatus | null;
  attended: boolean | null;
  updated_at: string;
};

export const isBoard = (member: Member) => member.role === "board";
