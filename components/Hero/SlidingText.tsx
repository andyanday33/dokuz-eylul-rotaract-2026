"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

type Props = {};

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const SlidingText = (props: Props) => {
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
        end: "+=100%",
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(".hero-fade", { opacity: 0, duration: 0.5 });

    tl.to("#slidingText", {
      top: 0,
      left: 0,
      xPercent: 0,
      width: "8rem",
    });
  }, {});

  return (
    <div
      id={"slidingText"}
      className="w-64 xs:w-72 sm:w-96 md:w-120 lg:w-xl xl:w-2xl aspect-989/541 fixed top-36 left-1/2"
      style={{
        transform: "translateX(-50%)",
      }}
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
