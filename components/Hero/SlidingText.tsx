"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wordmark } from "../Wordmark";

type Props = {
  /** Localised wordmark. Every variant is cropped to its artwork, so they all
      share the 790x318 box the fixed aspect ratio below is built on. */
  src: string;
  alt: string;
};

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The rules the wordmark is centred between, marked up in Hero. */
const RULE_TOP = '[data-masthead-rule="top"]';
const RULE_FOOT = '[data-masthead-rule="foot"]';

export const SlidingText = ({ src, alt }: Props) => {
  // Hacky way to reset sliding text position by refreshing
  // the page on resize, shouldn't affect the normal user
  // tl.scrollTrigger.refresh is not working properly.
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => window.location.reload(), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useGSAP(() => {
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
      const top = (gapTop + gapBottom) / 2 - heroTop - logo.offsetHeight / 2;

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

    // The end of the travel is the same size every other masthead renders the
    // wordmark at; read it rather than repeating the number here.
    const parkedWidth =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--masthead-logo-parked")
        .trim() || "6.5rem";

    // The wordmark becomes clickable only once it has arrived in the masthead.
    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "+=90%",
      onLeave: () =>
        document.querySelector(".wordmark-parkable")?.classList.add("is-parked"),
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

    // yPercent belongs to the end state only — the start keeps the Y axis free
    // of percentages so GSAP has nothing to re-derive. See globals.css.
    tl.to(
      "#slidingText",
      {
        top: "2rem",
        left: "5vw",
        xPercent: 0,
        yPercent: -50,
        width: parkedWidth,
      },
      "<",
    );

    return () => observer.disconnect();
  }, {});

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
