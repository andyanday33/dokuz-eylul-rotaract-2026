"use client";

import React from "react";

/**
 * Every scroll animation on the public site, in one place.
 *
 * The sections themselves are server components: they mark what should move
 * with an attribute and ship no JavaScript of their own. This is the only
 * client component the marketing page mounts, and the only thing that pulls
 * GSAP in.
 *
 * GSAP is imported dynamically rather than at the top of the file, which is
 * the whole point of the arrangement. Statically imported it sat in the first
 * chunk the browser had to parse before it could show anything — 60 KB
 * gzipped, a quarter of the page's JavaScript, to decorate a scroll that has
 * not happened yet. Loaded here it lands in its own chunk after paint.
 */

/**
 * How long the signature takes to write itself, start to finish. Shared out
 * across the strokes by length rather than spent per stroke — see `sign`.
 */
const SIGNATURE_SECONDS = 2.8;

/**
 * Whether an element is still below its own trigger line, and so has not been
 * seen yet.
 *
 * This is the price of loading GSAP late, and it has to be paid explicitly.
 * A reveal is written as an animation *from* a hidden state, which GSAP
 * applies the moment it is set up. While GSAP loaded with the page that was
 * invisible; now it arrives after the server's markup has been painted, so
 * setting up a reveal on something the reader is already looking at would
 * blink it out and fade it back in. Anything on screen when GSAP lands is
 * therefore left exactly as it was rendered — already in its finished state,
 * which is what the server sent — and only what is still below the fold is
 * wired up to animate.
 */
const unseen = (el: Element, startFraction: number) =>
  el.getBoundingClientRect().top > window.innerHeight * startFraction;

export const ScrollAnimations = () => {
  React.useEffect(() => {
    // Guards the case where the component unmounts, or React runs the effect
    // twice in development, before the import settles.
    let cancelled = false;
    let context: { revert: () => void } | undefined;

    const run = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { SplitText }] =
        await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/SplitText"),
        ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger, SplitText);

      // The stylesheet already silences the looping animations under this
      // preference; the scroll reveals never asked. Everything below either
      // moves something or hides it first, so the honest answer to the
      // preference is to leave the page as the server rendered it — which is
      // the finished state in every case.
      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      context = gsap.context(() => {
        if (!still) {
          // ---- Typography reveals ----
          document
            .querySelectorAll<HTMLElement>("[data-split]")
            .forEach((el) => {
              if (!unseen(el, 0.85)) return;
              const split = new SplitText(el, {
                type: "lines,words",
                linesClass: "overflow-hidden",
              });
              gsap.from(split.words, {
                yPercent: 115,
                duration: 0.9,
                ease: "power4.out",
                stagger: 0.03,
                scrollTrigger: { trigger: el, start: "top 85%" },
              });
            });

          document
            .querySelectorAll<HTMLElement>("[data-chars]")
            .forEach((el) => {
              if (!unseen(el, 0.88)) return;
              // Split to words as well as chars: chars alone are free-standing
              // inline blocks, so the browser will break a line mid-word.
              const split = new SplitText(el, { type: "words,chars" });
              gsap.from(split.chars, {
                opacity: 0,
                y: 18,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.02,
                scrollTrigger: { trigger: el, start: "top 88%" },
              });
            });

          gsap.utils.toArray<HTMLElement>(".rise").forEach((el) => {
            if (!unseen(el, 0.88)) return;
            gsap.from(el, {
              y: 40,
              opacity: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%" },
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((grid) => {
            if (!unseen(grid, 0.85)) return;
            gsap.from(grid.children, {
              y: 48,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.09,
              scrollTrigger: { trigger: grid, start: "top 85%" },
            });
          });

          gsap.utils.toArray<HTMLElement>(".rule").forEach((el) => {
            if (!unseen(el, 0.92)) return;
            gsap.from(el, {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 1.1,
              ease: "power3.inOut",
              scrollTrigger: { trigger: el, start: "top 92%" },
            });
          });

          // ---- The Four-Way Test's verdict stamps ----
          // Each one slams onto the paper, settling from a hard hit.
          gsap.utils.toArray<HTMLElement>("[data-stamp]").forEach((el) => {
            if (!unseen(el, 0.82)) return;
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

          sign(gsap);
          board(gsap);
        }

        // ---- The masthead earns its ground once the hero is behind it ----
        // A `to`, so nothing is hidden first and it is safe wherever the page
        // is scrolled to when GSAP lands.
        if (document.querySelector("#hero")) {
          gsap.to(".navbar", {
            backgroundColor:
              "color-mix(in oklab, var(--paper) 92%, transparent)",
            borderBottomColor:
              "color-mix(in oklab, var(--foreground) 15%, transparent)",
            backdropFilter: "blur(12px)",
            scrollTrigger: {
              trigger: "#hero",
              start: "80% top",
              toggleActions: "play none none reverse",
            },
          });
        }

        // ---- Parallax drift ----
        // Safe to wire up whatever is on screen: these are scrubbed against
        // the scroll from wherever the element already sits, so nothing is
        // hidden first and there is no state to flash out of. The section the
        // element sits in is the trigger — each ghost drifts for the length of
        // its own section, which is what the ref-scoped version did before the
        // sections became server components.
        if (!still) {
          gsap.utils
            .toArray<HTMLElement>("[data-drift-x], [data-drift-y]")
            .forEach((el) => {
              const section = el.closest("section");
              if (!section) return;
              gsap.to(el, {
                xPercent: Number(el.dataset.driftX ?? 0),
                yPercent: Number(el.dataset.driftY ?? 0),
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: Number(el.dataset.driftScrub ?? 1),
                },
              });
            });
        }
      });
    };

    void run();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return null;
};

/**
 * The president's signature inks itself in as it enters view.
 *
 * These are the mask strokes inside `PresidentSignature`; dashing them on
 * uncovers the traced outline beneath, so what appears has the real pen's
 * weight. One timeline for all of them, in document order, because a
 * signature is written in a set order and thirty-odd strokes arriving at once
 * would read as a smudge. Each stroke's duration is its share of the total
 * ink, which is what holds the pen to a single speed: given a fixed duration
 * the dot on an "i" would take as long as a long descender. `ease: "none"`
 * for the same reason — easing each stroke would make the pen hesitate at
 * both ends of every one of them.
 */
const sign = (gsap: typeof import("gsap").default) => {
  const strokes = gsap.utils.toArray<SVGPathElement>("[data-sig]");
  if (!strokes.length) return;

  // Nothing to do if the signature is already on screen: the server renders
  // these paths undashed, which is the signed state. Reaching in now would
  // only un-write it in order to write it again.
  const svg = strokes[0].ownerSVGElement;
  if (!svg || !unseen(svg, 0.88)) return;

  const lengths = strokes.map((p) => p.getTotalLength());
  const ink = lengths.reduce((total, len) => total + len, 0);

  // Each stroke is hidden outright until its turn, not merely dashed out of
  // sight. A stroke parked at `strokeDashoffset === length` is a zero-length
  // dash, and a zero-length dash under a round cap is a dot: Chrome paints one
  // for every stroke, so the signature sits there as a scatter of points
  // waiting to be joined up. Unhiding each as its tween starts leaves the only
  // round cap on screen the one under the nib — where it belongs, since that
  // one reads as the pen touching down.
  strokes.forEach((p, i) =>
    gsap.set(p, {
      strokeDasharray: lengths[i],
      strokeDashoffset: lengths[i],
      strokeOpacity: 0,
    }),
  );

  const draw = gsap.timeline({
    scrollTrigger: {
      trigger: svg,
      start: "top 88%",
      toggleActions: "play none none none",
    },
  });

  // Placed at explicit times rather than with `">"`. Two entries go in per
  // stroke, and `">"` means "the end of the entry inserted last" — which, once
  // the unhiding `set` is that entry, is the *start* of the stroke it belongs
  // to. The strokes would then pile up at time zero and the signature would
  // arrive already written.
  let at = 0;
  strokes.forEach((p, i) => {
    const duration = (lengths[i] / ink) * SIGNATURE_SECONDS;
    draw.set(p, { strokeOpacity: 1 }, at);
    draw.to(p, { strokeDashoffset: 0, ease: "none", duration }, at);
    at += duration;
  });
};

/**
 * The board's plate: the draughtsman's arrow inks itself in, then the ring and
 * its busts arrive.
 *
 * Lives here rather than in `Board` because none of it depends on which seat
 * the wheel has turned to — it is all keyed off ids in the markup. `Board`
 * stays a client component for the wheel's own state, but no longer carries
 * GSAP into the first chunk to do this.
 */
const board = (gsap: typeof import("gsap").default) => {
  const plate = "#board-plate";
  const arrowStroke = document.querySelector<SVGPathElement>("#arrow-stroke");
  const arrowHead = document.querySelector<SVGPathElement>("#arrow-head");
  const arrowText = document.querySelector("#arrow-text");
  const arrow = document.querySelector("#board-arrow");

  if (arrowStroke && arrowHead && arrowText && arrow && unseen(arrow, 0.8)) {
    const strokeLen = arrowStroke.getTotalLength();
    const headLen = arrowHead.getTotalLength();

    gsap.set(arrowStroke, {
      strokeDasharray: strokeLen,
      strokeDashoffset: strokeLen,
    });
    gsap.set(arrowHead, {
      strokeDasharray: headLen,
      strokeDashoffset: headLen,
    });
    gsap.set(arrowText, { opacity: 0 });

    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#board-arrow",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      })
      .to(arrowText, { opacity: 1, duration: 0.4 })
      .to(arrowStroke, {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: "power2.inOut",
      })
      .to(
        arrowHead,
        { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" },
        "-=0.1",
      );
  }

  // The ring and its centre mark fade up, then the busts arrive. The ring is
  // no longer inked on stroke by stroke — that animation works by overwriting
  // strokeDasharray with the path length, which leaves the circle solid once
  // it lands, and this one has to stay dashed.
  const plateEl = document.querySelector(plate);
  if (!plateEl || !unseen(plateEl, 0.82)) return;

  const busts = gsap.utils.toArray("[data-board] article");
  const fades = gsap.utils.toArray(`${plate} [data-fade]`);
  if (!busts.length) return;

  gsap.set(fades, { opacity: 0 });
  gsap.set(busts, { opacity: 0, scale: 0.8 });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: plate,
        start: "top 82%",
        toggleActions: "play none none none",
      },
    })
    .to(fades, { opacity: 1, duration: 0.8, ease: "power2.out" })
    .to(
      busts,
      {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        stagger: 0.07,
        ease: "back.out(1.6)",
        clearProps: "transform",
      },
      "-=0.45",
    );
};
