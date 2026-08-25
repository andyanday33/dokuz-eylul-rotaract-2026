import { getDictionary } from "@/i18n/dictionaries";
import { Grain, Vignette } from "../Editorial";

export const Hero = async () => {
  const { hero } = await getDictionary();

  return (
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
          <p className="eyebrow text-foreground/60">{hero.datelineLeft}</p>
          {/* Turkish place name in both locales, and `uppercase` cases by
              language — undeclared on the English page, İzmir loses its İ. */}
          <p lang="tr" className="eyebrow hidden text-foreground/55 sm:block">
            {hero.datelineRight}
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
            <h1 className="sr-only">{hero.srTitle}</h1>
            <p className="font-editorial max-w-2xl text-[8vw] italic leading-[1.08] sm:text-4xl lg:text-5xl">
              {hero.taglineLead}{" "}
              <span className="text-primary">{hero.taglineAccent}</span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-5 md:items-end md:text-right">
            <p className="max-w-xs text-sm font-light leading-relaxed text-foreground/60">
              {hero.meetingNote}
            </p>
            <a
              href="#join"
              className="eyebrow group inline-flex items-center gap-3 bg-foreground px-7 py-4 text-paper transition-colors hover:bg-primary"
            >
              {hero.cta}{" "}
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
  );
};
