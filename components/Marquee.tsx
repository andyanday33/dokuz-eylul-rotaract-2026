import type { CSSProperties } from "react";
import type { MarqueeBlock } from "@/cms/payload-types";

/**
 * How many times the strip is laid out end to end.
 *
 * Not a field, and not free to change on its own: the `marquee` keyframe in
 * `globals.css` slides the track by exactly one third of its width, which is
 * what makes the loop seamless. This number and that fraction are one decision
 * written in two places, and they have to move together.
 */
const REPEATS = 3;

/** What the stylesheet falls back to, and what the manifesto marquee runs at. */
const DEFAULT_SPEED = 20;

export const Marquee = ({ block }: { block: MarqueeBlock }) => (
  <div className="overflow-hidden border-y-2 border-foreground bg-primary py-3 text-primary-foreground">
    <div
      className="marquee-track flex w-max"
      style={
        {
          "--marquee-duration": `${block.speedSeconds ?? DEFAULT_SPEED}s`,
        } as CSSProperties
      }
    >
      {Array.from({ length: REPEATS }).map((_, i) => (
        // Only the first copy is read out; the others exist to fill the loop.
        <div key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
          {block.items.map((item) => (
            <span
              key={item.id ?? item.text}
              className="eyebrow flex items-center gap-6 pr-6"
            >
              {item.text}
              {block.separator ? <span aria-hidden>{block.separator}</span> : null}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);
