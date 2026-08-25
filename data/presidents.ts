/**
 * The club's roll of presidents, newest first, running back to its founding in
 * 1999.
 *
 * A Rotary year runs July to June, which is why every term is written as a
 * span rather than a single year.
 *
 * Only the sitting president is named. The rest carry the same "Ad Soyad"
 * placeholder the board and committee lists use, waiting on the club's own
 * records — the terms are real, the names are not. Names read the same in
 * every language, so the roll lives here rather than being duplicated across
 * the dictionaries.
 */
export type President = {
  /** Rotary year, e.g. "2026–27". */
  term: string;
  name: string;
};

/** The club was chartered in 1999; the 1999–00 term is its first. */
export const FOUNDING_TERM = "1999–00";

export const PRESIDENTS: President[] = [
  { term: "2026–27", name: "Mehmet Emre Uçar" },
  { term: "2025–26", name: "Ad Soyad" },
  { term: "2024–25", name: "Ad Soyad" },
  { term: "2023–24", name: "Ad Soyad" },
  { term: "2022–23", name: "Ad Soyad" },
  { term: "2021–22", name: "Ad Soyad" },
  { term: "2020–21", name: "Ad Soyad" },
  { term: "2019–20", name: "Ad Soyad" },
  { term: "2018–19", name: "Ad Soyad" },
  { term: "2017–18", name: "Ad Soyad" },
  { term: "2016–17", name: "Ad Soyad" },
  { term: "2015–16", name: "Ad Soyad" },
  { term: "2014–15", name: "Ad Soyad" },
  { term: "2013–14", name: "Ad Soyad" },
  { term: "2012–13", name: "Ad Soyad" },
  { term: "2011–12", name: "Ad Soyad" },
  { term: "2010–11", name: "Ad Soyad" },
  { term: "2009–10", name: "Ad Soyad" },
  { term: "2008–09", name: "Ad Soyad" },
  { term: "2007–08", name: "Ad Soyad" },
  { term: "2006–07", name: "Ad Soyad" },
  { term: "2005–06", name: "Ad Soyad" },
  { term: "2004–05", name: "Ad Soyad" },
  { term: "2003–04", name: "Ad Soyad" },
  { term: "2002–03", name: "Ad Soyad" },
  { term: "2001–02", name: "Ad Soyad" },
  { term: "2000–01", name: "Ad Soyad" },
  { term: "1999–00", name: "Ad Soyad" },
];

export const CURRENT_PRESIDENT = PRESIDENTS[0];
export const PAST_PRESIDENTS = PRESIDENTS.slice(1);

/** "2025–26" -> "25–26", the short form the site already uses on the board. */
export const shortTerm = (term: string) => term.slice(2);

/** The calendar decade a term begins in, for the scale's major graduations. */
export const decadeOf = (term: string) => Math.floor(Number(term.slice(0, 4)) / 10) * 10;

/** "1999–2027", read off the roll rather than written down twice. */
export const rollSpan = () => {
  const first = PRESIDENTS[PRESIDENTS.length - 1].term.slice(0, 4);
  const last = PRESIDENTS[0].term.slice(0, 4);
  return `${first}–${Number(last) + 1}`;
};
