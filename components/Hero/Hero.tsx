import type { HeroBlock } from "@/cms/payload-types";
import { Grain, Vignette } from "../Editorial";
import { SlidingText } from "./SlidingText";

/**
 * The opening screen, and the wordmark that travels out of it.
 *
 * The two arrive together because the wordmark cannot work alone: it centres
 * itself between the two rules marked up below and animates against `#hero`.
 * They are siblings rather than nested, which is how they were when the home
 * page named them one after the other — the wordmark is `position: fixed`, and
 * putting it inside a `.hero-fade` wrapper would fade it out along with the
 * dateline it is supposed to outlive.
 */
export const Hero = ({ block }: { block: HeroBlock }) => {
  // Localized upload, so this is the image for the language being read. Its
  // alt lives on the image rather than here: the wordmark means the same thing
  // wherever it is placed.
  //
  // A relation comes back as a bare id when a query asks for depth 0, and the
  // field is required so it should never be absent — but the home page is the
  // one page where being wrong about that would be a 500 rather than a gap, so
  // the travelling wordmark is dropped instead. The hero still reads.
  const wordmark = typeof block.wordmark === "object" ? block.wordmark : null;

  return (
    <>
      <section
        id="hero"
        className="relative flex min-h-screen flex-col overflow-hidden bg-paper text-foreground"
      >
        <Grain />
        <Vignette />

        {/* Dateline */}
        <div className="hero-fade wrapper">
          <div
            data-masthead-rule="top"
            className="flex items-center justify-between border-b border-foreground/20 pb-3 pt-24 sm:pt-28"
          >
            <p className="eyebrow text-foreground/60">{block.datelineLeft}</p>
            {/* Turkish place name in both locales, and `uppercase` cases by
                language — undeclared on the English page, İzmir loses its İ. */}
            <p lang="tr" className="eyebrow hidden text-foreground/55 sm:block">
              {block.datelineRight}
            </p>
          </div>
        </div>

        {/* Reserved space where the floating logo hovers */}
        <div className="hero-fade wrapper" aria-hidden>
          <div className="h-(--masthead-band)" />
        </div>

        {/* Masthead tagline + call to action */}
        <div className="hero-fade wrapper mt-auto pb-14">
          <div
            data-masthead-rule="foot"
            className="grid gap-10 border-t border-foreground/20 pt-8 md:grid-cols-[1.25fr_1fr] md:items-end"
          >
            <div>
              <h1 className="sr-only">{block.srTitle}</h1>
              <p className="font-editorial max-w-2xl text-[8vw] italic leading-[1.08] sm:text-4xl lg:text-5xl">
                {block.taglineLead}{" "}
                <span className="text-primary">{block.taglineAccent}</span>
              </p>
            </div>
            <div className="flex flex-col items-start gap-5 md:items-end md:text-right">
              <p className="max-w-xs text-sm font-light leading-relaxed text-foreground/60">
                {block.meetingNote}
              </p>
              <a
                href={block.ctaHref}
                className="eyebrow group inline-flex items-center gap-3 bg-foreground px-7 py-4 text-paper transition-colors hover:bg-primary"
              >
                {block.cta}{" "}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {wordmark?.url ? (
        <SlidingText src={wordmark.url} alt={wordmark.alt ?? ""} />
      ) : null}
    </>
  );
};
