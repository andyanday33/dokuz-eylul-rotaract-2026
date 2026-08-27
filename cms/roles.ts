/**
 * The two fixed role vocabularies the public site is built around.
 *
 * A role is a *key*, not a title: the titles themselves are translated and
 * live in the dictionaries, so a chair called "Kulüp Hizmetleri" in Turkish
 * and "Club Service" in English is one role here. That split is why these
 * lists are code rather than CMS content — editors change who holds a seat,
 * not which seats exist, and a new seat needs a translation in both
 * dictionaries before it can render at all.
 *
 * `satisfies` is the enforcement: renaming a key under `board.roles` or
 * `committees.roles` in the dictionaries breaks the build here rather than
 * quietly rendering `undefined` into the page.
 */
import type { Dictionary } from "../i18n/config";

export const BOARD_ROLES = [
  "president",
  "vicePresident",
  "secretary",
  "treasurer",
  "pastPresident",
] as const satisfies readonly (keyof Dictionary["board"]["roles"])[];

export const COMMITTEE_ROLES = [
  "club",
  "community",
  "vocational",
  "international",
  "publicImage",
  "foundation",
  "technology",
] as const satisfies readonly (keyof Dictionary["committees"]["roles"])[];

/** Rotary's seven areas of focus — a global programme, so the set is fixed. */
export const FOCUS_AREAS = [
  "peace",
  "disease",
  "water",
  "maternal",
  "education",
  "economy",
  "environment",
] as const;

export type BoardRole = (typeof BOARD_ROLES)[number];
export type CommitteeRole = (typeof COMMITTEE_ROLES)[number];
export type FocusArea = (typeof FOCUS_AREAS)[number];

/** Select options render in list order, which is also the order they display. */
export const optionsFrom = (keys: readonly string[]) =>
  keys.map((value) => ({ label: value, value }));
