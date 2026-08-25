"use client";

import React from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/config";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Fine-grain film noise, inlined so the broadsheet never looks flat.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Opening paragraph carries the drop cap; the rest of the letter is plain. */
const DROP_CAP =
  "first-letter:font-editorial first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[5.5rem] first-letter:font-medium first-letter:not-italic first-letter:leading-[0.66] first-letter:text-primary sm:first-letter:text-[7rem]";

/** The president's own name and portrait are the same in every language. */
const PRESIDENT_NAME = "Mehmet Emre Uçar";
const PRESIDENT_NAME_DISPLAY = "Mehmet Emre UÇAR";

export const PresidentsMessage = ({
  president,
}: {
  president: Dictionary["president"];
}) => {
  const scope = React.useRef<HTMLElement>(null);
  const portrait = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Signature strokes ink themselves in as they enter view.
      gsap.utils.toArray<SVGPathElement>("[data-sig]").forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: i * 0.35,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: p,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      // Portrait drifts against the scroll for depth.
      if (portrait.current) {
        gsap.to(portrait.current, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      // The colossal ghost word slides the opposite way.
      gsap.to("[data-ghost]", {
        xPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    },
    { scope },
  );

  return (
    <section
      id="president"
      ref={scope}
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
        data-ghost
        aria-hidden
        className="font-editorial pointer-events-none absolute -bottom-[6vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[42vw] italic leading-none text-background/[0.035]"
      >
        {president.watermark}
      </span>

      {/* Vertical margin dateline */}
      <span
        aria-hidden
        className="eyebrow absolute left-4 top-1/2 hidden -translate-y-1/2 rotate-180 text-background/40 [writing-mode:vertical-rl] lg:block"
      >
        {president.marginDateline}
      </span>

      <div className="wrapper relative z-10 py-24 sm:py-36">
        <p className="eyebrow rise text-primary">{president.eyebrow}</p>

        <h2
          data-stagger
          className="font-editorial mt-6 max-w-[15ch] text-[15vw] italic leading-[1.15] tracking-[-0.01em] sm:text-7xl lg:text-[7.5rem]"
        >
          {president.heading}
        </h2>

        <div className="rule rule-cranberry mt-10 h-0.5 w-full" />

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-20">
          {/* ===== Portrait: duotone print that develops on hover ===== */}
          <div ref={portrait} className="relative">
            <figure className="group relative w-full max-w-sm rotate-[-4deg] transition-transform duration-700 ease-out will-change-transform hover:rotate-0">
              <div className="relative aspect-4/5 overflow-hidden border border-background/15 bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                <Image
                  src="/president/portrait.jpeg"
                  alt={president.portraitAlt}
                  fill
                  sizes="(min-width: 640px) 384px, 90vw"
                  className="object-cover grayscale contrast-[1.05] brightness-95 transition-all duration-900 ease-out group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100"
                />
              </div>

              <figcaption className="mt-4 flex items-baseline justify-between border-t border-background/15 pt-4">
                <p className="font-editorial text-2xl italic">
                  {PRESIDENT_NAME_DISPLAY}
                </p>
                <p className="eyebrow text-primary">{president.captionTerm}</p>
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
                    letterSpacing: "0.24em",
                    fontSize: "10px",
                  }}
                >
                  <textPath href="#seal-arc" startOffset="0">
                    {president.sealText}
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
              className="space-y-6 text-lg font-light leading-relaxed text-background/70"
            >
              <p className="font-editorial text-xl italic text-background/85 sm:text-2xl">
                {president.salutation.map((line, i) => (
                  <React.Fragment key={line}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </React.Fragment>
                ))}
              </p>
              {president.openingParagraphs.map((text, i) => (
                <p key={i} className={i === 0 ? DROP_CAP : undefined}>
                  {text}
                </p>
              ))}
            </div>

            {/* Bleeding pull-quote */}
            <blockquote
              data-chars
              className="font-editorial relative z-20 my-10 -rotate-2 text-balance text-5xl italic leading-[1.05] text-primary sm:text-6xl lg:-ml-28 lg:text-7xl"
            >
              {president.pullQuote}
            </blockquote>

            <div
              data-stagger
              className="space-y-6 text-lg font-light leading-relaxed text-background/70"
            >
              {president.closingParagraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
              <p className="font-editorial text-2xl italic text-background sm:text-3xl">
                {president.valediction}
              </p>
            </div>

            {/* Signature */}
            <div className="relative mt-12 max-w-md">
              <p className="text-lg font-light text-background/70">
                {president.signOff}
              </p>
              <svg
                viewBox="0 0 320 120"
                className="-ml-1 mt-1 h-24 w-64 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  data-sig
                  d="M10,74 C40,18 62,20 60,56 C58,90 34,96 46,70 C58,44 96,40 112,72 C122,94 100,102 100,80 C100,54 142,44 168,72 C184,90 168,102 162,86 C150,54 202,40 232,66 C252,84 242,104 236,90 C231,79 246,64 300,58"
                />
                <path
                  data-sig
                  d="M8,104 C90,88 156,118 236,94 C276,82 300,90 314,84"
                />
              </svg>
              <p className="mt-2 border-t border-background/15 pt-3 text-sm text-background/60">
                <span className="font-semibold text-background">
                  {PRESIDENT_NAME}
                </span>{" "}
                · {president.signatureCredit}
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
              {president.manifesto.map((phrase) => (
                <React.Fragment key={phrase}>
                  {phrase}
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
