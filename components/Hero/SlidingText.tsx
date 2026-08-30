"use client";

import React from "react";
import { Wordmark } from "../Wordmark";

type Props = {
  /** Localised wordmark. Every variant is cropped to its artwork, so they all
      share the 790x318 box the fixed aspect ratio below is built on. */
  src: string;
  alt: string;
};

/** The rules the wordmark is centred between, marked up in Hero. */
const RULE_TOP = '[data-masthead-rule="top"]';
const RULE_FOOT = '[data-masthead-rule="foot"]';

export const SlidingText = ({ src, alt }: Props) => {
  /**
   * Reload when the window is resized, because the travel below is measured
   * once and a new viewport invalidates it. `ScrollTrigger.refresh()` was
   * tried first and did not restore the position correctly.
   *
   * Width only. On a phone this listener does not fire because the window
   * changed — it fires because the address bar slid away, which is a change in
   * *height* and happens on the first flick of a scroll. The hero is exactly
   * where that scroll starts, so the page reloaded underneath anyone reading
   * it, which then re-showed the address bar, which fired it again.
   *
   * Rotating the device changes the width and still reloads, which is the case
   * this was written for. A height-only change is a browser chrome animation
   * and nothing here needs to know about it.
   */
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let width = window.innerWidth;

    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(() => window.location.reload(), 200);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // GSAP is fetched here rather than imported at the top of the file. It is
  // the heaviest thing the marketing page loads, and none of what it does
  // below can happen before the browser has painted the hero anyway — so it
  // travels in its own chunk instead of in the one that blocks first paint.
  //
  // What the reader sees in the meantime is the hero as the server rendered
  // it: `--masthead-logo-y` in globals.css already places the wordmark within
  // a few pixels of where `place()` will put it, which is exactly the margin
  // that variable exists to cover.
  React.useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const run = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // A context, so that tearing down reverts every tween and trigger made
      // inside it — including the standalone `ScrollTrigger.create` below,
      // which nothing else holds a handle to.
      const context = gsap.context(() => {
        /**
         * Sit the wordmark exactly between the dateline rule and the rule above
         * the tagline. Neither position is expressible in CSS: the tagline block
         * is pushed to the bottom of a min-h-screen section by `mt-auto`, so the
         * lower rule moves with the viewport height, and its distance from the
         * bottom depends on how the copy happens to wrap in the current locale.
         *
         * Positions are read in document space and rebased onto the hero's own
         * top, because what we want is where the logo sits when the hero is
         * aligned to the top of the viewport — the animation's start — which is
         * not necessarily where the page is scrolled to when this runs.
         */
        let placed = NaN;

        const place = () => {
          const logo = document.querySelector<HTMLElement>("#slidingText");
          const hero = document.querySelector<HTMLElement>("#hero");
          const head = document.querySelector<HTMLElement>(RULE_TOP);
          const foot = document.querySelector<HTMLElement>(RULE_FOOT);
          if (!logo || !hero || !head || !foot) return;

          const scrolled = window.scrollY;
          const gapTop = head.getBoundingClientRect().bottom + scrolled;
          const gapBottom = foot.getBoundingClientRect().top + scrolled;
          const heroTop = hero.getBoundingClientRect().top + scrolled;
          const top =
            (gapTop + gapBottom) / 2 - heroTop - logo.offsetHeight / 2;

          if (Math.abs(top - placed) < 0.5) return;
          placed = top;
          gsap.set(logo, { top });
          ScrollTrigger.refresh();
        };

        place();

        /**
         * One measurement at hydration is too early. The font swap reflows the
         * tagline and the viewport settling moves the min-h-screen floor, and both
         * shift the lower rule afterwards — so watch the two boxes that decide the
         * gap rather than guessing when they have stopped moving.
         */
        const observer = new ResizeObserver(place);
        for (const sel of ["#hero", RULE_FOOT]) {
          const el = document.querySelector(sel);
          if (el) observer.observe(el);
        }

        // The wordmark becomes clickable only once it has arrived in the masthead.
        ScrollTrigger.create({
          trigger: "#hero",
          start: "top top",
          end: "+=90%",
          onLeave: () =>
            document
              .querySelector(".wordmark-parkable")
              ?.classList.add("is-parked"),
          onEnterBack: () =>
            document
              .querySelector(".wordmark-parkable")
              ?.classList.remove("is-parked"),
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "+=90%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(".hero-fade", { opacity: 0 });

        /**
         * Where the travel ends, read off the slot the masthead reserves for
         * it rather than worked out again here.
         *
         * `left: "5vw"` was right only up to 1600px. The wrapper is `90vw`
         * until it hits a `max-width: 90rem` and then centres, so past that
         * its left edge is `(100vw - 90rem) / 2` — 240px at 1920, where 5vw is
         * 96px, and the wordmark sat 144px outside the column everything else
         * lines up to. Measuring the slot is also why changing the wrapper's
         * width will not quietly desynchronise the two again.
         *
         * A function rather than a value because the timeline sets
         * `invalidateOnRefresh`: GSAP re-runs it on every ScrollTrigger
         * refresh, so a resized window re-measures instead of animating to the
         * old viewport's number.
         */
        const travel = () => {
          const logo = document.querySelector<HTMLElement>("#slidingText");
          const slot = document.querySelector("[data-masthead-park]");
          if (!logo || !slot) return { scale: 1, x: 0, y: 0 };

          // Layout size, so unaffected by whatever transform is on the element
          // at the moment this runs — which matters because it runs again on
          // every refresh, by which time a scrub may be mid-flight.
          const w = logo.offsetWidth;
          const h = logo.offsetHeight;

          // Where the element sits with no transform of ours: `left: 50%` less
          // the resting `translateX(-50%)`. `clientWidth` rather than
          // `innerWidth` because a desktop scrollbar is inside one and not the
          // other, and `left: 50%` resolves against the narrower of the two.
          const restLeft = document.documentElement.clientWidth / 2 - w / 2;

          const end = slot.getBoundingClientRect();
          const scale = end.width / w;

          return {
            scale,
            x: end.left - restLeft,
            // Centred on the slot: the masthead centres it vertically, and
            // after scaling the element is `h * scale` tall.
            y: end.top + end.height / 2 - (h * scale) / 2 - placed,
          };
        };

        // yPercent belongs to the end state only — the start keeps the Y axis free
        // of percentages so GSAP has nothing to re-derive. See globals.css.
        /**
         * The travel is a transform, and nothing else.
         *
         * It used to animate `top`, `left` and `width`. Those are layout
         * properties: every scrubbed frame made the browser lay the page out
         * again, repaint it, and only then composite — sixty times a second,
         * on a phone, while it is also scrolling. That is what the jank was.
         * `x`, `y` and `scale` compose into one matrix the compositor can
         * apply on its own, touching neither layout nor paint.
         *
         * Functions rather than values, for the same reason as before: the
         * timeline sets `invalidateOnRefresh`, so each is re-measured on
         * refresh instead of being frozen at the first viewport.
         *
         * `transformOrigin` is the top-left corner so the arithmetic above can
         * stay simple — scaling about the centre would move the corner too,
         * and both offsets would have to account for it.
         */
        gsap.set("#slidingText", { transformOrigin: "0 0", force3D: true });

        tl.to(
          "#slidingText",
          {
            scale: () => travel().scale,
            x: () => travel().x,
            y: () => travel().y,
          },
          "<",
        );

        return () => observer.disconnect();
      });

      cleanup = () => context.revert();
    };

    void run();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      id={"slidingText"}
      className="w-(--masthead-logo-w) aspect-790/318 fixed top-(--masthead-logo-y) left-1/2 z-50"
      style={{
        transform: "translateX(-50%)",
      }}
    >
      <Wordmark
        href="#hero"
        src={src}
        alt={alt}
        priority
        className="wordmark-parkable"
      />
    </div>
  );
};
