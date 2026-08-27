import { decadeOf, type President } from "@/lib/presidents";

/**
 * The roll drawn as a scale rather than a list.
 *
 * Two things are true of these terms that are not true of most timelines: each
 * one lasts exactly a year, and there are no gaps between them. So every row
 * is given the same height — a term is a span you occupy, not a point you
 * pass — and the rule down the left runs unbroken from the club's first term
 * to the present, with a graduation reaching across to each name.
 *
 * Across twenty-eight terms the rows are set tight on purpose. A rule with its
 * graduations close together reads as an instrument; the same marks spread out
 * read as a list of cards, and cost a screen and a half of scrolling besides.
 * Every decade start takes a heavier, longer graduation, the way a real scale
 * distinguishes major divisions from minor ones.
 *
 * Entries are expected oldest first, so the scale reads the way time does:
 * it begins at the founding and arrives on the president now in office.
 */
export function PresidentTimeline({
  entries,
  currentTerm,
  currentLabel,
  foundingTerm,
  foundingLabel,
}: {
  entries: President[];
  currentTerm?: string;
  currentLabel?: string;
  foundingTerm?: string;
  foundingLabel?: string;
}) {
  return (
    <ol className="mt-12 max-w-3xl">
      {entries.map((p, i) => {
        const serving = p.term === currentTerm;
        const founding = p.term === foundingTerm;
        const major =
          i > 0 && decadeOf(p.term) !== decadeOf(entries[i - 1].term);
        const note = serving ? currentLabel : founding ? foundingLabel : null;

        return (
          <li
            key={`${p.term}-${p.name}`}
            className="grid min-h-11 grid-cols-[5rem_1.5rem_1fr] items-stretch gap-x-4 sm:min-h-13 sm:grid-cols-[5.5rem_2.5rem_1fr] sm:gap-x-6"
          >
            <span
              className={`eyebrow self-center whitespace-nowrap text-right tabular-nums ${
                serving ? "text-primary" : major ? "text-foreground/70" : "text-foreground/45"
              }`}
            >
              {p.term}
            </span>

            {/* the scale: an unbroken rule, graduated once per term, with a
                heavier and longer mark wherever a decade begins */}
            <span aria-hidden className="relative">
              <span
                className={`absolute inset-y-0 left-0 w-px ${
                  serving ? "bg-primary" : "bg-foreground/20"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 ${
                  serving
                    ? "h-px w-[calc(100%+0.5rem)] bg-primary"
                    : major
                      ? "h-0.5 w-[calc(100%+0.5rem)] bg-foreground/40"
                      : "h-px w-full bg-foreground/22"
                }`}
              />
            </span>

            <span className="flex flex-wrap items-baseline gap-x-3 self-center">
              <span
                className={`font-editorial text-xl italic leading-tight sm:text-2xl ${
                  serving ? "text-primary" : ""
                }`}
              >
                {p.name}
              </span>
              {note ? (
                <span
                  className={`eyebrow ${serving ? "text-primary" : "text-foreground/45"}`}
                >
                  {note}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
