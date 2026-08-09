"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

type Props = {};

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const SlidingText = (props: Props) => {
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=100%",
        scrub: 1,
      },
    });
    tl.fromTo(
      "#slidingText",
      {
        xPercent: -50,
        yPercent: -50,
      },
      {
        top: 0,
        left: 0,
        xPercent: 0,
        yPercent: 0,
        width: "10%",
      },
    );
  }, {});

  return (
    <div
      id={"slidingText"}
      className="w-1/2 aspect-989/541 fixed top-1/2 left-1/2"
      style={{}}
    >
      <Image
        src="/dokuz_eylul.png"
        alt="Dokuz Eylül Rotaract Kulübü"
        width={989}
        height={541}
        priority
        quality={100}
        className="object-contain"
      />
    </div>
  );
};
