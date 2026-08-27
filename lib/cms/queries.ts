import "server-only";
import { cache } from "react";
import { LOCALES, type Locale } from "@/i18n/config";
import {
  BOARD_ROLES,
  COMMITTEE_ROLES,
  FOCUS_AREAS,
  type BoardRole,
  type CommitteeRole,
  type FocusArea,
} from "@/cms/roles";
import type { Media } from "@/cms/payload-types";
import type { President } from "@/lib/presidents";
import { cms } from "./client";

/**
 * The site's reads from the CMS.
 *
 * Each one is wrapped in React's `cache`, so a section and the page that
 * frames it can both ask for the roll of presidents and the database is
 * queried once. That is per-request memoisation, not a cache across requests:
 * an edit in `/admin` shows on the next page load with nothing to invalidate.
 *
 * The shapes returned are the site's, not Payload's — a portrait is a URL
 * string here, never a populated upload document — so a component never has
 * to know what depth a relation came back at.
 */

/** The rendered portrait, cropped square if the size exists, else the original. */
const portrait = (photo: number | Media | null | undefined): string | null => {
  if (!photo || typeof photo !== "object") return null;
  return photo.sizes?.portrait?.url ?? photo.url ?? null;
};

/**
 * Drops rows whose `role` is not one the site can render.
 *
 * The select field makes this near-impossible through the panel, but a role
 * removed from `cms/roles.ts` leaves its rows behind in the database, and a
 * seat with no translated title would render an empty label rather than fail.
 */
const known = <T extends string>(roles: readonly T[], value: string): value is T =>
  (roles as readonly string[]).includes(value);

export type Seat<Role extends string> = {
  role: Role;
  name: string;
  photo: string | null;
};

/** Newest term first — the order the roll is read in everywhere it appears. */
export const getPresidents = cache(async (): Promise<President[]> => {
  const payload = await cms();
  const { docs } = await payload.find({
    collection: "presidents",
    sort: "-term",
    pagination: false,
  });
  return docs.map(({ term, name }) => ({ term, name }));
});

export const getBoard = cache(async (): Promise<Seat<BoardRole>[]> => {
  const payload = await cms();
  const { docs } = await payload.find({
    collection: "board-members",
    sort: "order",
    pagination: false,
  });
  return docs
    .filter((doc) => known(BOARD_ROLES, doc.role))
    .map((doc) => ({
      role: doc.role as BoardRole,
      name: doc.name,
      photo: portrait(doc.photo),
    }));
});

export const getCommitteeChairs = cache(async (): Promise<Seat<CommitteeRole>[]> => {
  const payload = await cms();
  const { docs } = await payload.find({
    collection: "committee-chairs",
    sort: "order",
    pagination: false,
  });
  return docs
    .filter((doc) => known(COMMITTEE_ROLES, doc.role))
    .map((doc) => ({
      role: doc.role as CommitteeRole,
      name: doc.name,
      photo: portrait(doc.photo),
    }));
});

export type FocusEntry = {
  id: FocusArea;
  /** The cause, in the language being read. */
  title: string;
  body: string;
  /** The same cause in the other language — the small-caps line above it. */
  alt: string;
};

/**
 * The seven areas of focus, in Rotary's order, each carrying both languages.
 *
 * Read at `locale: "all"`, which hands back every localized field as a map
 * keyed by locale. The section sets each cause twice — once in the language
 * of the page and once in the other — and taking both from one document is
 * what keeps the pair from ever describing two different things.
 */
export const getAreasOfFocus = cache(
  async (locale: Locale): Promise<FocusEntry[]> => {
    const payload = await cms();
    const { docs } = await payload.find({
      collection: "areas-of-focus",
      locale: "all",
      pagination: false,
    });

    const other = LOCALES.find((l) => l !== locale) ?? locale;
    // `locale: "all"` widens every localized field to a per-locale map, which
    // the generated single-locale types do not describe.
    const all = docs as unknown as {
      key: string;
      title: Partial<Record<Locale, string>>;
      body: Partial<Record<Locale, string>>;
    }[];

    return FOCUS_AREAS.flatMap((id) => {
      const doc = all.find((d) => d.key === id);
      if (!doc) return [];
      return [
        {
          id,
          title: doc.title[locale] ?? "",
          body: doc.body[locale] ?? "",
          alt: doc.title[other] ?? "",
        },
      ];
    });
  },
);
