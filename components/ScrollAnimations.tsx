"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export const ScrollAnimations = () => {
  useGSAP(() => {
    // ---- Typography reveals ----
    document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
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

    document.querySelectorAll<HTMLElement>("[data-chars]").forEach((el) => {
      const split = new SplitText(el, { type: "chars" });
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
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((grid) => {
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
      gsap.from(el, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.1,
        ease: "power3.inOut",
        scrollTrigger: { trigger: el, start: "top 92%" },
      });
    });
  }, {});

  return null;
};
