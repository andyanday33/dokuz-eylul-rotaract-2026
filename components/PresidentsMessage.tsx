import React from "react";
import Image from "next/image";
import type { Media, PresidentsMessageBlock } from "@/cms/payload-types";
import { shortTerm } from "@/lib/presidents";
import { PresidentSignature } from "./PresidentSignature";

// Fine-grain film noise, inlined so the broadsheet never looks flat.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Circumference of the r=44 circle the wax seal's label is set on. The label is
 * CMS copy of no fixed length, and a `textPath` silently clips whatever runs off
 * the end of its path — so the text is set to this length rather than left to
 * fall where its natural width lands.
 */
const SEAL_ARC_LENGTH = 2 * Math.PI * 44;

/** Opening paragraph carries the drop cap; the rest of the letter is plain. */
const DROP_CAP =
  "first-letter:font-editorial first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[5.5rem] first-letter:font-medium first-letter:not-italic first-letter:leading-[0.66] first-letter:text-primary sm:first-letter:text-[7rem]";

/**
 * "Mehmet Emre Uçar" -> "Mehmet Emre UÇAR", the way a name is set under a
 * portrait here. Cased in Turkish explicitly: the default rules would turn the
 * "ı" in a surname like "Çalışkan" into "I" rather than "I"'s dotless twin,
 * and a surname is exactly where that shows.
 */
const surnameInCaps = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const surname = parts.pop();
  if (!surname) return name;
  return [...parts, surname.toLocaleUpperCase("tr")].join(" ");
};

export const PresidentsMessage = ({
  block,
  name,
  term,
}: {
  block: PresidentsMessageBlock;
  /**
   * Whoever is at the head of the roll, and the Rotary year they serve. The
   * letter is the block's own content; these two are facts about a person and
   * belong to the `presidents` collection — typing them here again is how the
   * signature and the roll come to disagree the first time a term changes
   * hands. The board's wheel reads its centre mark the same way.
   */
  name: string;
  term: string;
}) => {
  // Named apart from the `portrait` ref below, which is the parallax handle
  // on the figure rather than the image inside it.
  const portraitImage =
    typeof block.portrait === "object" ? (block.portrait as Media) : null;
  return (
    <section
      id="president"
      className="relative overflow-hidden bg-[oklch(0.16_0.02_350)] text-background"
    >
      {/* Grain + column rules for the printed-page atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_calc(50%-0.5px),color-mix(in_oklab,var(--background)_8%,transparent)_50%,transparent_calc(50%+0.5px))]"
      />

      {/* Colossal ghost wordmark bleeding off the bottom edge */}
      <span
        data-drift-x="-8"
        aria-hidden
        className="font-editorial pointer-events-none absolute -bottom-[6vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[42vw] italic leading-none text-background/[0.035]"
      >
        {block.watermark}
      </span>

      {/* Vertical margin dateline */}
      <span
        aria-hidden
        className="eyebrow absolute left-4 top-1/2 hidden -translate-y-1/2 rotate-180 text-background/40 [writing-mode:vertical-rl] lg:block"
      >
        {block.marginDateline}
      </span>

      <div className="wrapper relative z-10 py-24 sm:py-36">
        <p className="eyebrow rise text-primary">{block.eyebrow}</p>

        <h2
          data-stagger
          className="display-1 font-editorial mt-6 max-w-[15ch] italic leading-[1.15] tracking-[-0.01em]"
        >
          {block.heading}
        </h2>

        <div className="rule rule-cranberry mt-10 h-0.5 w-full" />

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-20">
          {/* ===== Portrait: duotone print that develops on hover ===== */}
          {/* Drifts against the scroll for depth. Named apart from the
              figure inside it, which is the thing that rotates on hover. */}
          <div data-drift-y="-12" data-drift-scrub="0.6" className="relative">
            <figure className="group relative w-full max-w-sm rotate-[-4deg] transition-transform duration-700 ease-out will-change-transform hover:rotate-0">
              <div className="relative aspect-4/5 overflow-hidden border border-background/15 bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                <Image
                  src={portraitImage?.url ?? ""}
                  alt={portraitImage?.alt ?? ""}
                  fill
                  sizes="(min-width: 640px) 384px, 90vw"
                  className="object-cover grayscale contrast-[1.05] brightness-95 transition-all duration-900 ease-out group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100"
                />
              </div>

              <figcaption className="mt-4 flex items-baseline justify-between border-t border-background/15 pt-4">
                <p className="font-editorial text-2xl italic">
                  {surnameInCaps(name)}
                </p>
                <p className="eyebrow text-primary">{shortTerm(term)}</p>
              </figcaption>
            </figure>

            {/* Rotating wax-seal stamp */}
            <div className="absolute -right-3 -top-6 h-28 w-28 sm:-right-8 sm:h-32 sm:w-32">
              <svg
                viewBox="0 0 120 120"
                className="orbit-spin h-full w-full text-primary"
              >
                <defs>
                  <path
                    id="seal-arc"
                    d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
                    fill="none"
                  />
                </defs>
                <text
                  className="fill-current"
                  style={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontSize: "8px",
                  }}
                >
                  <textPath
                    href="#seal-arc"
                    startOffset="0"
                    textLength={SEAL_ARC_LENGTH}
                    lengthAdjust="spacing"
                  >
                    {block.sealText}
                  </textPath>
                </text>
              </svg>
              <span className="font-editorial absolute inset-0 flex items-center justify-center text-2xl italic text-primary">
                ✦
              </span>
            </div>
          </div>

          {/* ===== The letter ===== */}
          <div className="relative">
            <div
              data-stagger
              className="prose-copy max-w-[66ch] space-y-6 text-lg font-light leading-relaxed text-background/70"
            >
              <p className="font-editorial text-xl italic text-background/85 sm:text-2xl">
                {block.salutation.split("\n").map((line, i) => (
                  <React.Fragment key={line}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </React.Fragment>
                ))}
              </p>
              {block.openingParagraphs.map((para, i) => (
                <p
                  key={para.id ?? i}
                  className={i === 0 ? DROP_CAP : undefined}
                >
                  {para.text}
                </p>
              ))}
            </div>

            {/* Bleeding pull-quote */}
            {/* `role="img"` for the same reason as the figures in Numbers:
                the `blockquote` role does not permit the `aria-label` that
                SplitText needs in order to hide the glyphs it makes. The cost
                is that the pull-quote is no longer announced as a quotation —
                worth it only because its own contents are `aria-hidden` the
                moment it is split, so the alternative is a quotation that
                reads as empty. */}
            <blockquote
              data-chars
              role="img"
              aria-label={block.pullQuote}
              className="font-editorial relative z-20 my-10 -rotate-2 text-balance text-5xl italic leading-[1.05] text-primary sm:text-6xl lg:-ml-28 lg:text-7xl"
            >
              {block.pullQuote}
            </blockquote>

            <div
              data-stagger
              className="prose-copy max-w-[66ch] space-y-6 text-lg font-light leading-relaxed text-background/70"
            >
              {block.closingParagraphs.map((para, i) => (
                <p key={para.id ?? i}>{para.text}</p>
              ))}
              <p className="font-editorial text-2xl italic text-background sm:text-3xl">
                {block.valediction}
              </p>
            </div>

            {/* Signature */}
            <div className="relative mt-12 max-w-md">
              <p className="text-lg font-light text-background/70">
                {block.signOff}
              </p>
              <PresidentSignature className="-ml-1 mt-1 w-56 text-primary sm:w-72" />
              <p className="mt-2 border-t border-background/15 pt-3 text-sm text-background/60">
                <span className="font-semibold text-background">{name}</span> ·{" "}
                {block.signatureCredit}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kinetic closing manifesto */}
      <div className="relative z-10 overflow-hidden border-y border-background/12 py-9">
        <div className="marquee-track flex w-max whitespace-nowrap">
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className="font-editorial flex items-center gap-8 pr-8 text-3xl italic leading-normal text-background/80 sm:text-4xl"
              aria-hidden={k > 0}
            >
              {block.manifesto.map((phrase, i) => (
                <React.Fragment key={phrase.id ?? i}>
                  {phrase.text}
                  <span className="text-primary">✦</span>
                </React.Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
