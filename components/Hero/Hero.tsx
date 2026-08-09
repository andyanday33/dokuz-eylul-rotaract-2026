"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

type Props = {};

gsap.registerPlugin(useGSAP);

export const Hero = (props: Props) => {
  const heroContainer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
    },
    { scope: heroContainer },
  );

  return (
    <div
      ref={heroContainer}
      id="hero"
      className="wrapper min-h-screen flex flex-col relative"
    ></div>
  );
};
