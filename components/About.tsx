import type { AboutBlock } from "@/cms/payload-types";
import { Grain, Nameplate } from "./Editorial";

/**
 * The first of the numbered sections, and the first whose words are CMS
 * content rather than dictionary copy.
 *
 * It takes them as a prop rather than fetching, which is what lets the same
 * section appear twice on a site saying two different things — the point of a
 * page builder. The block it is given is the generated type, so a field added
 * in `cms/blocks/about.ts` arrives here as a compile error until it is used or
 * deliberately ignored.
 */
export const About = ({ block }: { block: AboutBlock }) => (
  <section
    id="hakkimizda"
    className="relative overflow-hidden bg-paper text-foreground"
  >
    <Grain />
    {/* Ghost watermark */}
    <span
      aria-hidden
      className="font-editorial pointer-events-none absolute -right-[3vw] top-[10vw] select-none text-[40vw] italic leading-none text-foreground/[0.03]"
    >
      {block.watermark}
    </span>

    <div className="wrapper relative z-10 py-24 sm:py-36">
      <Nameplate
        index={block.index}
        label={block.label}
        meta={block.meta ?? undefined}
        metaLang="tr"
      />

      <h2
        data-chars
        className="font-editorial mt-8 max-w-4xl text-[11vw] italic leading-[1.1] tracking-[-0.015em] sm:text-6xl lg:text-7xl"
      >
        {block.heading}
      </h2>

      <div className="mt-16 grid gap-x-12 gap-y-12 border-t border-foreground/15 pt-12 md:grid-cols-3">
        {block.pillars.map((p) => (
          <article key={p.id ?? p.n} className="rise">
            <span className="font-editorial text-5xl italic text-primary">
              {p.n}
            </span>
            <h3 className="font-editorial mt-4 text-2xl italic">{p.title}</h3>
            <p className="mt-3 font-light leading-relaxed text-foreground/70">
              {p.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
