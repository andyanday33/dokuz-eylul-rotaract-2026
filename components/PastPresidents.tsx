import Link from "next/link";
import { PAST_PRESIDENTS, rollSpan, shortTerm } from "@/data/presidents";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { Grain, Nameplate } from "./Editorial";

/**
 * The most recent terms, set as one continuous run of type — a roll of honour
 * rather than a table. The point of the section is that there is a line of
 * them, so the names are given as a single mass and read as a body.
 *
 * It shows a dozen rather than all of them. The club has been going since
 * 1999, and the full twenty-eight run to well over a screen of names on a
 * phone; the complete scale, with every term, is the job of /presidents.
 *
 * Each entry is an inline-block, which does two things: it keeps a name and
 * its term from ever breaking across a line, and it makes the entries
 * transformable, so the shared `data-stagger` reveal deals them out one after
 * another — the succession the heading describes, enacted rather than stated.
 */
/** How many of the most recent past terms the home page carries. */
const SHOWN = 12;

export const PastPresidents = async () => {
  const { presidents } = await getDictionary();
  const lang = await getLocale();

  return (
    <section
      id="past-presidents"
      className="relative overflow-hidden bg-wine text-paper"
    >
      <Grain variant="ink" />

      <div className="wrapper relative z-10 py-20 sm:py-28">
        <Nameplate
          index={presidents.index}
          label={presidents.label}
          meta={rollSpan()}
          tone="wine"
        />

        <h2
          data-chars
          className="font-editorial mt-8 max-w-2xl text-[10vw] italic leading-[1.05] tracking-[-0.015em] sm:text-5xl"
        >
          {presidents.heading}
        </h2>

        {/* No separators between entries: a mark that trails each name dangles
            whenever a line breaks after it. The term does the delimiting, and
            the space between entries does the rest. */}
        <ul
          data-stagger
          className="mt-12 leading-[1.5] sm:mt-14"
        >
          {PAST_PRESIDENTS.slice(0, SHOWN).map((p) => (
            <li key={p.term} className="mr-9 inline-block last:mr-0">
              <span className="font-editorial text-3xl italic sm:text-4xl">
                {p.name}
              </span>
              <span className="eyebrow ml-2 text-paper/75 tabular-nums">
                {shortTerm(p.term)}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href={`/${lang}/presidents`}
          className="eyebrow rise group mt-12 inline-flex items-center gap-3 text-paper transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
        >
          {presidents.seeAll}
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
};
