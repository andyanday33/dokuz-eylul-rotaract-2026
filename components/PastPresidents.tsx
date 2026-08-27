import Link from "next/link";
import type { PastPresidentsBlock } from "@/cms/payload-types";
import { rollSpan } from "@/lib/presidents";
import { getPresidents } from "@/lib/cms/queries";
import { getLocale } from "@/i18n/dictionaries";
import { Grain, Nameplate } from "./Editorial";

/**
 * The most recent terms, set as a ledger of handovers.
 *
 * The year leads and the name follows, both at display size, because that is
 * the way round the thing works: a Rotary year is the unit of office and the
 * person is what changes. Set that way the years stack into a true numeric
 * column — 2025–26, 2024–25, 2023–24 — read straight down as an unbroken
 * count, and the name is what each one resolves to. A rule carries the eye
 * across, the way a leader does in an index.
 *
 * This replaced a continuous run of prose where name and term sat side by side
 * and the term did the delimiting. It could not: at a glance one entry ran
 * into the next, and no amount of colour on the term fixes a problem that is
 * structural.
 *
 * It shows a dozen rather than all — `shown` on the block, defaulting to
 * twelve. The complete scale is the job of /presidents, and the last row of
 * the ledger is the way there: it carries the number of terms *not* shown, so
 * what is missing is what invites the click.
 *
 * The rows are list items so the shared `data-stagger` reveal deals them out
 * one after another — the succession the heading describes, enacted rather
 * than stated. That is the only motion here; the ledger does the rest.
 */
export const PastPresidents = async ({
  block,
}: {
  block: PastPresidentsBlock;
}) => {
  const lang = await getLocale();
  // Read from Başkanlar on every render rather than copied onto the block:
  // adding a president is one row there and this follows from it.
  const roll = await getPresidents();
  // The roll comes back newest first, and its head is whoever is in office —
  // this section is the ones before them.
  const past = roll.slice(1, 1 + block.shown);
  // Past presidents the ledger has no room for. The head of the roll is in
  // office, so it is not one of them.
  const rest = Math.max(0, roll.length - 1 - past.length);

  return (
    <section
      id="past-presidents"
      className="relative overflow-hidden bg-wine text-paper"
    >
      <Grain variant="ink" />

      <div className="wrapper relative z-10 py-20 sm:py-28">
        <Nameplate
          index={block.index}
          label={block.label}
          meta={rollSpan(roll)}
          tone="wine"
        />

        <h2
          data-chars
          className="font-editorial mt-8 max-w-2xl text-[10vw] italic leading-[1.05] tracking-[-0.015em] sm:text-5xl"
        >
          {block.heading}
        </h2>

        {/* The leader rule is the only decoration here, and it earns its
            place by doing the joining the old layout asked whitespace to do.
            Hidden from assistive tech: the row already reads "2025–26, İslam
            Aydemir" in order, which is the whole of it. */}
        <ol data-stagger className="mt-12 sm:mt-16">
          {past.map((p) => (
            <li
              key={`${p.term}-${p.name}`}
              className="flex items-baseline gap-x-3 py-2 sm:gap-x-6 sm:py-2.5"
            >
              <span className="font-editorial shrink-0 text-2xl tabular-nums text-brass sm:text-3xl lg:text-4xl">
                {p.term}
              </span>
              <span aria-hidden className="mb-[0.35em] h-px flex-1 bg-brass/30" />
              <span className="font-editorial min-w-0 text-right text-2xl italic sm:text-3xl lg:text-4xl">
                {p.name}
              </span>
            </li>
          ))}

          {/* The way to the rest of the roll, set as one more row so the ledger
              reads as continuing past the twelve rather than stopping. */}
          <li className="pt-6 sm:pt-8">
            <Link
              href={`/${lang}/presidents`}
              className="group flex items-baseline gap-x-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper sm:gap-x-6"
            >
              {rest > 0 ? (
                <span className="font-editorial shrink-0 text-2xl tabular-nums text-brass/60 transition-colors group-hover:text-brass sm:text-3xl lg:text-4xl">
                  +{rest}
                </span>
              ) : null}
              <span aria-hidden className="mb-[0.35em] h-px flex-1 bg-brass/30" />
              <span className="eyebrow shrink-0 text-paper transition-opacity group-hover:opacity-70">
                {block.seeAll}
              </span>
              <span
                aria-hidden
                className="shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </Link>
          </li>
        </ol>

      </div>
    </section>
  );
};
