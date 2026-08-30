import type { JoinBlock } from "@/cms/payload-types";
import { Grain } from "./Editorial";

export const Join = ({ block }: { block: JoinBlock }) => {
  return (
    <section
      id="join"
      className="relative overflow-hidden bg-primary text-primary-foreground"
    >
      <Grain variant="ink" />
      {/* Ghost watermark */}
      <span
        aria-hidden
        className="font-editorial pointer-events-none absolute -bottom-[8vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[34vw] italic leading-none text-primary-foreground/[0.06]"
      >
        {block.watermark}
      </span>

      <div className="wrapper relative z-10 py-28 sm:py-36">
        <p className="eyebrow rise">{block.eyebrow}</p>
        <h2
          data-chars
          className="display-3 font-editorial mt-6 max-w-3xl italic leading-[1.05]"
        >
          {block.heading}
        </h2>
        <p className="prose-copy rise mt-8 max-w-lg text-lg font-light opacity-90">
          {block.body}
        </p>
        <a
          href={`mailto:${block.email}`}
          className="eyebrow group mt-10 inline-flex items-center gap-3 bg-background px-7 py-4 text-primary transition-transform hover:-translate-y-0.5"
        >
          {/* Cased as English, deliberately. `.eyebrow` uppercases, and
              `text-transform` follows the element's language — under the
              page's `lang="tr"` the browser maps i to İ, so the address would
              read İNFO@… and be wrong for anyone who typed it back. An address
              is not Turkish text; it is not really any language. */}
          <span lang="en">{block.email}</span>{" "}
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
};
