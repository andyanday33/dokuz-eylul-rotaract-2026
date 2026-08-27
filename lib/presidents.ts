/**
 * The arithmetic of a Rotary year.
 *
 * The roll of presidents itself used to live here as a literal; it is CMS
 * content now, read through `lib/cms/queries.ts`. What is left is everything
 * that is true of a *term* whatever the roll contains — pure functions, shared
 * by the three places the roll is set.
 *
 * A Rotary year runs July to June, which is why a term is a span ("2026–27")
 * rather than a single year, and why the club's twenty-eighth year ends in
 * 2027 rather than 2026.
 *
 * Every function here takes the roll newest-first, the order the CMS returns
 * it and the order it is read in on the page.
 */
export type President = {
  /** Rotary year, e.g. "2026–27". */
  term: string;
  name: string;
};

/** "2025–26" -> "25–26", the short form the site already uses on the board. */
export const shortTerm = (term: string) => term.slice(2);

/** The calendar decade a term begins in, for the scale's major graduations. */
export const decadeOf = (term: string) =>
  Math.floor(Number(term.slice(0, 4)) / 10) * 10;

/** The club's first term — the oldest on the roll. */
export const foundingTerm = (roll: President[]) => roll.at(-1)?.term ?? "";

/** The year the club was chartered, as a bare "1999". */
export const foundingYear = (roll: President[]) => foundingTerm(roll).slice(0, 4);

/** "1999–2027", read off the roll rather than written down twice. */
export const rollSpan = (roll: President[]) => {
  const first = foundingYear(roll);
  const last = roll[0]?.term.slice(0, 4);
  return first && last ? `${first}–${Number(last) + 1}` : "";
};
