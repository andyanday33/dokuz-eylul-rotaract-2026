"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Grain } from "./Editorial";
import { RotaryWheel } from "./RotaryWheel";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BOARD = [
  { name: "Ad Soyad", role: "Başkan", photo: "/board/baskan.jpg" },
  { name: "Ad Soyad", role: "Asbaşkan", photo: "/board/asbaskan.jpg" },
  { name: "Ad Soyad", role: "Sekreter", photo: "/board/sekreter.jpg" },
  { name: "Ad Soyad", role: "Sayman", photo: "/board/sayman.jpg" },
  { name: "Ad Soyad", role: "Geçmiş Dönem Başkanı", photo: "/board/gdb.jpg" },
];

/** Repeated around the wheel's rim band; the trailing separator is what
    makes the wrap read continuously rather than butting two words together. */
const RIM_MARK = "YÖNETİM KURULU 2026—27 · ";

/** Where member i sits on the orbit, in degrees, twelve o'clock first. */
const seatAngle = (i: number) => -90 - (360 / BOARD.length) * i;

/** Polar → percentage coordinates inside a square box. */
const seat = (i: number, r: number) => {
  const a = (seatAngle(i) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
};

export const Board = () => {
  const [active, setActive] = React.useState(0);
  const [rotation, setRotation] = React.useState(0);
  const step = 360 / BOARD.length;

  useGSAP(() => {
    const arrowStroke = document.querySelector(
      "#arrow-stroke",
    ) as SVGPathElement;
    const arrowHead = document.querySelector("#arrow-head") as SVGPathElement;
    const arrowText = document.querySelector("#arrow-text");

    if (!arrowStroke || !arrowHead || !arrowText) return;

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

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#board-arrow",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    tl.to(arrowText, { opacity: 1, duration: 0.4 })
      .to(
        arrowStroke,
        { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" },
        "<0.1",
      )
      .to(
        arrowHead,
        { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" },
        "-=0.1",
      );

    // Desktop: the plate inks itself in, outside-in, the way it would be drawn
    const plate = "#board-plate";
    const strokes = gsap.utils.toArray<SVGGeometryElement>(
      `${plate} [data-draw]`,
    );
    if (!strokes.length) return;

    strokes.forEach((el) => {
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.set(`${plate} [data-fade]`, { opacity: 0 });

    const members = gsap.utils.toArray("[data-board] article");
    gsap.set(members, { opacity: 0, scale: 0.8 });

    const ink = { duration: 0.5, strokeDashoffset: 0, ease: "power2.inOut" };

    gsap
      .timeline({
        scrollTrigger: {
          trigger: plate,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      })
      .to(`${plate} [data-draw="orbit"]`, { ...ink, duration: 0.7 })
      .to(`${plate} [data-draw="cogs"]`, { ...ink, duration: 1.1 }, "-=0.45")
      .to(`${plate} [data-draw="rim"]`, ink, "-=0.6")
      .to(
        `${plate} [data-draw="spoke"]`,
        { ...ink, duration: 0.4, stagger: 0.06 },
        "-=0.3",
      )
      .to(`${plate} [data-draw="hub"]`, { ...ink, duration: 0.4 }, "-=0.2")
      .to(`${plate} [data-fade]`, { opacity: 1, duration: 0.6 }, "-=0.3")
      .to(
        members,
        {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.07,
          ease: "back.out(1.6)",
          clearProps: "transform",
        },
        "-=0.5",
      );
  }, {});

  const prev = () => {
    setActive((i) => (i - 1 + BOARD.length) % BOARD.length);
    setRotation((r) => r - step);
  };
  const next = () => {
    setActive((i) => (i + 1) % BOARD.length);
    setRotation((r) => r + step);
  };
  const goTo = (i: number) => {
    const diff = i - active;
    setActive(i);
    setRotation((r) => r + diff * step);
  };

  const touchRef = React.useRef<{ x: number; y: number; locked: boolean | null } | null>(null);
  const swipeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;

    const onMove = (e: TouchEvent) => {
      if (!touchRef.current) return;
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      // First significant move: decide if horizontal or vertical
      if (touchRef.current.locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        touchRef.current.locked = Math.abs(dx) > Math.abs(dy);
      }
      if (touchRef.current.locked) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, locked: null };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const diff = touchRef.current.x - e.changedTouches[0].clientX;
    if (touchRef.current.locked && Math.abs(diff) > 40) {
      // Wheel now spins clockwise toward "next", so the next member rides up
      // from the left — dragging left rotates back, dragging right goes forward.
      if (diff > 0) prev();
      else next();
    }
    touchRef.current = null;
  };

  return (
    <section
      id="board"
      className="relative overflow-hidden bg-paper text-foreground"
    >
      <Grain />
      <div className="wrapper relative z-10 py-20 sm:py-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow rise text-primary">04 — Yönetim kurulu</p>
            <h2
              data-chars
              className="font-editorial mt-3 max-w-2xl text-4xl italic leading-[1.1] sm:text-5xl"
            >
              Beş kişi, tek bir görev
            </h2>
          </div>
          <p className="rise max-w-md text-sm font-light text-foreground/60">
            Yönetim kurulu üyeleri kulübün stratejik yönünü belirler ve her
            üyenin sorumluluk almasını sağlar.
          </p>
        </div>
        <div className="rule rule-cranberry mt-8 h-[2px] w-full" />

        {/* Curved arrow label */}
        <div
          id="board-arrow"
          className="relative mx-auto mt-12 w-full max-w-[300px] sm:max-w-[560px] lg:max-w-[680px]"
        >
          <svg
            viewBox="0 0 400 60"
            className="mx-auto mb-8 w-64 sm:w-64 text-muted-foreground"
            fill="none"
          >
            <defs>
              <path id="arrow-curve" d="M 60,32 Q 200,-8 340,32" />
            </defs>
            <text
              id="arrow-text"
              className="fill-current text-[1.4rem]"
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                fontSize: "0.7rem",
              }}
            >
              <textPath
                href="#arrow-curve"
                startOffset="50%"
                textAnchor="middle"
              >
                Çark saat yönünde döner
              </textPath>
            </text>
            <path
              id="arrow-stroke"
              d="M 55,50 Q 200,10 345,50"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              id="arrow-head"
              d="M 339,43 L 346,51 L 336,53"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ===== MOBILE: arc wheel peeking from top ===== */}
        <div ref={swipeRef} className="sm:hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {/* Clip container — shows the top arc of the wheel. Height and the
              centre offset below are tuned together: the flanking members sit
              74px below centre and the hub crown 75px, so they enter the frame
              together. Both are off-canvas on a phone anyway (the ring is
              wider than the viewport), so the clip stops just above them and
              what's left is a clean sweep of cogs. */}
          <div className="relative mx-auto h-[240px] w-full overflow-hidden">
            {/* The wheel: a large circle whose centre sits below the clip */}
            <div
              className="absolute h-[520px] w-[520px]"
              style={{
                left: "50%",
                top: "320px",
                translate: "-50% -50%",
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.7s ease-out",
              }}
            >
              {/* the wheel itself — its cogs are what you see arcing overhead */}
              <div className="pointer-events-none absolute inset-[4%]">
                <RotaryWheel className="h-full w-full" mark={RIM_MARK} />
              </div>

              {/* members mounted on the cog tips */}
              {BOARD.map((m, i) => {
                const { x, y } = seat(i, 46);
                return (
                  <button
                    key={m.role}
                    onClick={() => goTo(i)}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      translate: "-50% -50%",
                      transform: `rotate(${-rotation}deg)`,
                      transition: "transform 0.7s ease-out",
                    }}
                    className="absolute text-center"
                  >
                    <div
                      className={`mx-auto overflow-hidden rounded-full border-2 shadow-[0_0_0_7px_var(--paper)] transition-all duration-500 ${
                        i === active
                          ? "h-24 w-24 border-primary ring-2 ring-primary/30"
                          : "h-14 w-14 border-foreground/20 opacity-50"
                      }`}
                    >
                      <img
                        src={m.photo}
                        alt={`${m.name} portresi`}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Fade-out edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-paper to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-paper to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
          </div>

          {/* Active member info + controls */}
          <div className="mt-4 text-center">
            <h3 className="font-editorial text-xl italic leading-tight">
              {BOARD[active].name}
            </h3>
            <p className="eyebrow mt-1 text-foreground/55">
              {BOARD[active].role}
            </p>

            <div className="mt-5 flex items-center justify-center gap-6">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 transition-colors hover:border-primary hover:text-primary"
                aria-label="Önceki üye"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12L6 8L10 4" />
                </svg>
              </button>
              <span className="eyebrow text-muted-foreground">
                {String(active + 1).padStart(2, "0")} / {String(BOARD.length).padStart(2, "0")}
              </span>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 transition-colors hover:border-primary hover:text-primary"
                aria-label="Sonraki üye"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 4L10 8L6 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ===== DESKTOP: the wheel as a draughtsman's plate ===== */}
        <div
          id="board-plate"
          className="relative mx-auto hidden aspect-square w-full max-w-[560px] sm:block lg:max-w-[680px]"
        >
          {/* the circle the members ride, struck like a construction line */}
          <svg
            viewBox="0 0 100 100"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <circle
              data-draw="orbit"
              cx="50"
              cy="50"
              r="43"
              fill="none"
              className="stroke-foreground/30"
              strokeWidth="0.28"
              strokeDasharray="0.7 1.5"
            />
          </svg>

          {/* the wheel, turning clockwise under its own weight */}
          <div className="orbit-spin-slow pointer-events-none absolute inset-[26%]">
            <RotaryWheel className="h-full w-full" mark={RIM_MARK} />
          </div>

          <div data-board className="absolute inset-0">
            {BOARD.map((m, i) => {
              const { x: left, y: top } = seat(i, 43);
              return (
                <article
                  key={m.role}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  className="group absolute w-36 -mt-16 -translate-x-1/2 text-center lg:w-40 lg:-mt-18"
                >
                  {/* the paper halo knocks the orbit line out behind each bust */}
                  <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border border-foreground/20 shadow-[0_0_0_9px_var(--paper)] ring-1 ring-transparent transition-all duration-500 group-hover:border-primary group-hover:ring-primary/40 lg:h-36 lg:w-36">
                    <img
                      src={m.photo}
                      alt={`${m.name} portresi`}
                      loading="lazy"
                      width={400}
                      height={400}
                      className="board-photo h-full w-full object-cover group-hover:scale-105 group-hover:[filter:grayscale(0)_contrast(1.05)_brightness(1)]"
                    />
                  </div>
                  {/* Cased rather than backed by a panel: a field big enough
                      to clear the orbit line would also lie across the wheel. */}
                  <h3 className="font-editorial paper-cased mt-3 text-lg italic leading-tight transition-colors group-hover:text-primary">
                    {m.name}
                  </h3>
                  <p className="eyebrow paper-cased mt-1 text-xs text-foreground/55">
                    {m.role}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
