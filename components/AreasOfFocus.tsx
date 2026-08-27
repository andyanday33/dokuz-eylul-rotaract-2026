import { getLocale } from "@/i18n/dictionaries";
import type { AreasOfFocusBlock } from "@/cms/payload-types";
import { getAreasOfFocus } from "@/lib/cms/queries";
import { Grain, Nameplate } from "./Editorial";

/**
 * The seven areas of focus, set as an index.
 *
 * Each cause is named twice: the name Rotary uses worldwide, in small caps
 * above, and the name it goes by here, at full scale below. That pairing is
 * the only device in the section, and it carries the one fact worth telling —
 * these are a global programme, run locally.
 *
 * They are deliberately not numbered. The seven are parallel and co-equal, so
 * an order would assert a rank Rotary does not give them, and the page already
 * spends 01—07 on its own sections, this being 06.
 */
export const AreasOfFocus = async ({ block }: { block: AreasOfFocusBlock }) => {
  // Each entry carries both languages: the cause in the language of the page,
  // and the same cause in the other, which is the small-caps line above it.
  const areas = await getAreasOfFocus(await getLocale());

  return (
    <section
      id="focus"
      className="relative overflow-hidden bg-paper text-foreground"
    >
      <Grain />

      <div className="wrapper relative z-10 py-24 sm:py-32">
        <Nameplate
          index={block.index}
          label={block.label}
          meta={block.meta ?? undefined}
          metaLang={block.altLang}
        />

        <h2
          data-chars
          className="font-editorial mt-8 max-w-3xl text-[10vw] italic leading-[1.05] tracking-[-0.015em] sm:text-5xl lg:text-6xl"
        >
          {block.heading}
        </h2>

        <ul data-stagger className="mt-16 sm:mt-20">
          {areas.map((a) => (
            <li
              key={a.id}
              className="group grid gap-3 border-t border-foreground/15 py-8 last:border-b md:grid-cols-[1.5fr_1fr] md:items-end md:gap-12 sm:py-10"
            >
              <div>
                {/* The label is in the other language, and `uppercase` cases
                    by language — without this, "Fighting" would be set with
                    Turkish rules and come out "FİGHTİNG". */}
                <p lang={block.altLang} className="eyebrow text-primary">
                  {a.alt}
                </p>
                <h3 className="font-editorial mt-2 text-3xl italic leading-[1.02] tracking-[-0.01em] transition-transform duration-500 group-hover:md:translate-x-2 motion-reduce:transition-none sm:text-5xl lg:text-[3.5rem]">
                  {a.title}
                </h3>
              </div>
              <p className="max-w-md text-sm font-light leading-relaxed text-foreground/65 md:pb-2">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
