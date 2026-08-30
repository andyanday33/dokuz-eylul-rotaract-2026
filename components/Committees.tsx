import { fill, getDictionary } from "@/i18n/dictionaries";
import type { CommitteesBlock } from "@/cms/payload-types";
import { getCommitteeChairs } from "@/lib/cms/queries";
import { Grain } from "./Editorial";

/** Stands in until a portrait has been uploaded for a chair. */
const PLACEHOLDER = "/chairs/placeholder.jpg";

export const Committees = async ({ block }: { block: CommitteesBlock }) => {
  // Only the role titles now — a committee's name belongs to the committee,
  // not to this page. See `cms/blocks/committees.ts`.
  const { committees } = await getDictionary();
  // Who holds a chair is CMS content; what the chair is called is a
  // translation, so the role key is what joins the two.
  const chairs = (await getCommitteeChairs()).map((c) => ({
    ...c,
    photo: c.photo ?? PLACEHOLDER,
    title: committees.roles[c.role],
    alt: fill(block.portraitAlt, { name: c.name }),
  }));

  return (
    <section
      id="committees"
      className="relative overflow-hidden bg-ink text-paper"
    >
      <Grain variant="ink" />

      <div className="wrapper relative z-10 py-20 sm:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow rise text-primary">{block.eyebrow}</p>
            <h2
              data-chars
              className="font-editorial mt-3 max-w-2xl text-balance text-4xl italic leading-[1.1] sm:text-5xl"
            >
              {block.heading}
            </h2>
          </div>
          <p className="prose-copy rise max-w-md text-sm font-light text-paper/60">
            {block.intro}
          </p>
        </div>
        <div className="rule rule-cranberry mt-8 h-[2px] w-full" />

        {/* Desktop: slat accordion */}
        <ul
          data-stagger
          className="mt-10 hidden gap-1 sm:flex sm:h-[420px] lg:h-[480px]"
        >
          {chairs.map((c, i) => (
            <li
              key={c.role}
              className="group relative flex-[1_1_0%] overflow-hidden rounded-sm bg-black transition-[flex-grow] duration-700 ease-out hover:flex-[3.4_1_0%]"
            >
              <img
                src={c.photo}
                alt={c.alt}
                loading="lazy"
                className="chair-photo absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:[filter:sepia(0)_saturate(1.05)]"
              />
              <div className="absolute inset-0 bg-ink/55 transition-opacity duration-700 group-hover:opacity-0" />
              <span className="absolute left-3 top-3 eyebrow text-paper/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* Rotated label at rest */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rotate-180 transition-opacity duration-300 [writing-mode:vertical-rl] group-hover:opacity-0">
                <span className="font-editorial whitespace-nowrap text-xl italic text-paper">
                  {c.title}
                </span>
              </div>
              {/* Horizontal card on hover */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="inline-block max-w-full rounded-md bg-paper/95 px-4 py-3 text-foreground backdrop-blur-sm">
                  <p className="eyebrow text-primary">{c.title}</p>
                  <h3 className="font-editorial mt-1 whitespace-nowrap text-lg italic leading-tight">
                    {c.name}
                  </h3>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Mobile: staggered offset strip list */}
        <ul data-stagger className="mt-8 flex flex-col gap-2 sm:hidden">
          {chairs.map((c, i) => (
            <li
              key={c.role}
              className="group relative h-24 overflow-hidden rounded-sm"
              style={{ marginLeft: `${(i % 3) * 12}px` }}
            >
              <img
                src={c.photo}
                alt={c.alt}
                loading="lazy"
                className="chair-photo absolute inset-0 h-full w-full object-cover object-[50%_40%] grayscale"
              />
              <div className="absolute inset-0 bg-ink/55" />
              <div className="absolute inset-0 flex items-center justify-between gap-3 px-4">
                <div className="min-w-0">
                  <p className="eyebrow text-paper/75">{c.title}</p>
                  <h3 className="font-editorial mt-0.5 text-lg italic text-paper">
                    {c.name}
                  </h3>
                </div>
                <span className="eyebrow text-paper/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
