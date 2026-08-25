"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Reused paper tooth — same fractal noise as the President's broadsheet.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const FOUR_WAY_TEST = [
  {
    r: "I",
    q: "Doğru mu?",
    a: "Her eylemimizde dürüstlüğü ve şeffaflığı ön planda tutuyoruz.",
    stamp: "Doğru",
    rot: -9,
  },
  {
    r: "II",
    q: "İlgili herkese adil mi?",
    a: "Kararlarımızda eşitliği ve adaleti gözetiyor, kimseyi dışlamıyoruz.",
    stamp: "Adil",
    rot: 7,
  },
  {
    r: "III",
    q: "İyi niyet ve dostluk yaratacak mı?",
    a: "Projelerimizle toplumda güven ve kalıcı dostluklar inşa ediyoruz.",
    stamp: "Dostça",
    rot: -6,
  },
  {
    r: "IV",
    q: "İlgili herkes için yararlı olacak mı?",
    a: "Hizmetlerimizin herkese somut fayda sağlamasını hedefliyoruz.",
    stamp: "Yararlı",
    rot: 8,
  },
];

export const FourWayTest = () => {
  const scope = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Each verdict stamp slams onto the paper, settling from a hard hit.
      gsap.utils.toArray<HTMLElement>("[data-stamp]").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1.7, opacity: 0, rotate: 16 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.45,
            ease: "power4.out",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // The colossal ghost question mark drifts against the scroll.
      gsap.to("[data-ghost]", {
        yPercent: -10,
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
      id="four-way-test"
      ref={scope}
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
        data-ghost
        aria-hidden
        className="font-editorial pointer-events-none absolute -right-[4vw] top-[8vw] select-none text-[46vw] italic leading-none text-foreground/[0.04]"
      >
        ?
      </span>

      <div className="wrapper relative z-10 py-24 sm:py-36">
        {/* Masthead nameplate */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-4">
          <p className="eyebrow rise text-primary">02 — Dörtlü Öz Denetim</p>
          <p className="eyebrow rise text-foreground/45">
            The Four-Way Test · Est. 1932
          </p>
        </div>

        <h2
          data-chars
          className="font-editorial mt-8 max-w-5xl text-[11vw] italic leading-[1.12] tracking-[-0.015em] sm:text-6xl lg:text-8xl"
        >
          Düşündüğümüz, söylediğimiz ve yaptığımız her şeyde…
        </h2>

        {/* The four questions, as stamped articles */}
        <div className="mt-16 border-t border-foreground/15">
          {FOUR_WAY_TEST.map((item) => (
            <article
              key={item.r}
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
                  className="font-editorial text-4xl italic leading-[1.1] tracking-[-0.01em] sm:text-5xl"
                >
                  {item.q}
                </h3>
                <div className="rule rule-cranberry mt-5 h-0.5 w-full" />
                <p className="rise mt-5 text-lg font-light leading-relaxed text-foreground/70">
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
          Dört soru — tek bir vicdan
        </p>
      </div>
    </section>
  );
};
