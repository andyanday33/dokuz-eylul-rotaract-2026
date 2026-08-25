"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

type Props = {
  /** Localised wordmark. Every variant is cropped to its artwork, so they all
      share the 790x318 box the fixed aspect ratio below is built on. */
  src: string;
  alt: string;
};

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

    tl.to(
      "#slidingText",
      {
        top: "2rem",
        left: "5vw",
        xPercent: 0,
        yPercent: -50,
        width: "6.5rem",
      },
      "<",
    );
  }, {});

  return (
    <div
      id={"slidingText"}
      className="w-64 xs:w-72 sm:w-96 md:w-120 lg:w-xl xl:w-2xl aspect-790/318 fixed top-40 left-1/2 z-50"
      style={{
        transform: "translateX(-50%)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={790}
        height={318}
        priority
        quality={100}
        className="object-contain"
      />
    </div>
  );
};
