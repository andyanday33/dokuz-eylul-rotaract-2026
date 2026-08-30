import type { NumbersBlock } from "@/cms/payload-types";
import { Grain } from "./Editorial";

export const Numbers = ({ block }: { block: NumbersBlock }) => (
  <section className="relative overflow-hidden bg-ink text-paper">
    <Grain variant="ink" />

    <div className="wrapper relative z-10 py-20 sm:py-28">
      <p className="eyebrow rise text-primary">{block.eyebrow}</p>
      <div className="mt-10 grid gap-10 border-t border-paper/15 pt-10 sm:grid-cols-3">
        {block.stats.map((stat) => (
          <div key={stat.id ?? stat.label} className="rise">
            {/* Announced as one graphic rather than as a paragraph.
                SplitText shreds this into per-character spans and marks each
                one `aria-hidden`, leaving the element itself to carry the
                reading — which it does through `aria-label`, an attribute the
                implicit `paragraph` role does not permit. `img` does, and it
                is the honest description of a figure drawn as loose glyphs.
                The label is written here as well as by SplitText so the
                element is never a role=img without a name: before hydration,
                and for anyone whose JavaScript never arrives. */}
            <p
              data-chars
              role="img"
              aria-label={stat.big}
              className="font-editorial text-6xl italic leading-none text-primary sm:text-7xl lg:text-8xl"
            >
              {stat.big}
            </p>
            <p className="prose-copy mt-4 text-sm font-light text-paper/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
