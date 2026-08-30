import type { FourWayTestBlock } from "@/cms/payload-types";

// Reused paper tooth — same fractal noise as the President's broadsheet.
/**
 * Paper tooth, as a tile rather than a filter.
 *
 * This was an inline `feTurbulence` SVG, which Chromium rasterises once and
 * WebKit re-evaluates on every repaint. On an iPhone-sized WebKit that single
 * difference held the board wheel at 11fps; with the grain drawn from a raster
 * tile instead it runs at 60. See scripts/make-grain.mjs.
 *
 * `repeat` at the tile's own size, so the grain stays the same size in every
 * section instead of stretching with the element as the SVG did.
 */
const GRAIN = "url(/grain.png)";

/**
 * The numeral each question is set under, and how far its stamp is knocked off
 * square. Fixed, and paired with the questions by position: the test has had
 * four questions since 1932, so the CMS pins the array to exactly four rows
 * and this list supplies the rest. See `cms/blocks/four-way-test.ts`.
 */
const PLATES = [
  { r: "I", rot: -9 },
  { r: "II", rot: 7 },
  { r: "III", rot: -6 },
  { r: "IV", rot: 8 },
];

/** Belt and braces for a row count the CMS already enforces. */
const NO_PLATE = { r: "", rot: 0 };

export const FourWayTest = ({ block }: { block: FourWayTestBlock }) => {
  const items = block.items.map((item, i) => ({
    ...(PLATES[i] ?? NO_PLATE),
    ...item,
  }));
  return (
    <section
      id="four-way-test"
      className="relative overflow-hidden border-y border-foreground/10 bg-[oklch(0.945_0.016_85)] text-foreground"
    >
      {/* Aged-paper vignette + grain tooth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_-10%,transparent_55%,color-mix(in_oklab,var(--foreground)_12%,transparent)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />

      {/* Colossal ghost query watermark */}
      <span
        data-drift-y="-10"
        aria-hidden
        className="font-editorial pointer-events-none absolute -right-[4vw] top-[8vw] select-none text-[46vw] italic leading-none text-foreground/[0.04]"
      >
        ?
      </span>

      <div className="wrapper relative z-10 py-24 sm:py-36">
        {/* Masthead nameplate */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-4">
          <p className="eyebrow rise text-primary">{block.eyebrow}</p>
          <p className="eyebrow rise text-foreground/45">{block.meta}</p>
        </div>

        <h2
          data-chars
          className="display-2 font-editorial mt-8 max-w-5xl italic leading-[1.12] tracking-[-0.015em]"
        >
          {block.heading}
        </h2>

        {/* The four questions, as stamped articles */}
        <div className="mt-16 border-t border-foreground/15">
          {items.map((item) => (
            <article
              key={item.id ?? item.r}
              className="group relative grid items-start gap-x-8 gap-y-5 border-b border-foreground/15 py-12 sm:py-14 md:grid-cols-[auto_1fr_auto] md:gap-x-14"
            >
              {/* Roman numeral */}
              <span className="font-editorial text-6xl italic leading-none text-primary sm:text-7xl lg:text-8xl">
                {item.r}
              </span>

              {/* Question + verdict */}
              <div className="max-w-2xl sm:pr-36 md:pr-0">
                <h3
                  data-chars
                  className="font-editorial text-balance text-4xl italic leading-[1.1] tracking-[-0.01em] sm:text-5xl"
                >
                  {item.q}
                </h3>
                <div className="rule rule-cranberry mt-5 h-0.5 w-full" />
                <p className="prose-copy rise mt-5 text-lg font-light leading-relaxed text-foreground/70">
                  {item.a}
                </p>
              </div>

              {/* Rubber approval stamp */}
              <div
                aria-hidden
                className="absolute right-0 top-10 hidden sm:block md:static md:justify-self-end md:self-center"
              >
                <div style={{ transform: `rotate(${item.rot}deg)` }}>
                  <div
                    data-stamp
                    className="relative flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-primary text-primary opacity-90 mix-blend-multiply sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                  >
                    <span className="pointer-events-none absolute inset-[7px] rounded-full border border-primary/45" />
                    <span className="font-editorial text-lg italic tracking-[0.02em] sm:text-xl lg:text-2xl">
                      {item.stamp}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Colophon */}
        <p className="eyebrow rise mt-10 text-foreground/45">
          {block.colophon}
        </p>
      </div>
    </section>
  );
};
