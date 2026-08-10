"use client";

import React, { useRef } from "react";
import Image from "next/image";

type Props = {};

export const Hero = (props: Props) => {
  return (
    <section id="hero" className="wrapper min-h-screen flex flex-col relative">
      <div className="hero-fade flex w-full justify-center pt-30">
        <p data-hero-meta className="eyebrow text-muted-foreground">
          Rotaract · 2440. Bölge · Grup 4
        </p>
      </div>

      <div className="wrapper hero-fade">
        <div className="h-36 xs:h-40 sm:h-52 md:h-66 lg:h-80 xl:h-92" aria-hidden />
        <div className="hero-fade grid gap-10 border-t border-border pt-8 md:grid-cols-[1.2fr_1fr]">
          <h1 className="sr-only">Rotaract Kulübü — hizmetle gelen dostluk</h1>
          <p
            data-hero-subtitle
            className="max-w-xl text-2xl font-light leading-snug sm:text-3xl"
          >
            Genç profesyoneller,{" "}
            <em className="not-italic text-primary">tek bir söz</em> — dostluğu
            mahallenin ölçebileceği bir hizmete dönüştürmek.
          </p>
          <div className="flex flex-col items-start gap-4 md:items-end md:text-right">
            <p className="max-w-xs text-sm text-muted-foreground">
              Her ayın birinci ve üçüncü perşembesi 19.00’da Eski Kütüphane’de
              buluşuyoruz. Konuklar her zaman davetlidir.
            </p>
            <a
              href="#join"
              className="eyebrow inline-flex items-center gap-3 bg-primary px-6 py-4 text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Kulübe katıl <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
