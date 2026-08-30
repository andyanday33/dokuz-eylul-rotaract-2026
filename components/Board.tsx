"use client";

import React from "react";
import Image from "next/image";
import { fill, type Dictionary } from "@/i18n/config";
import type { BoardBlock } from "@/cms/payload-types";
import { Grain } from "./Editorial";
import { shortTerm } from "@/lib/presidents";
import type { Seat } from "@/lib/cms/queries";
import type { BoardRole } from "@/cms/roles";

/** Stands in until a portrait has been uploaded for a seat. */
const PLACEHOLDER = "/board/placeholder.jpg";

/** Where member i of `count` sits on the orbit, in degrees, twelve o'clock first. */
const seatAngle = (i: number, count: number) => -90 - (360 / count) * i;

/** Polar → percentage coordinates inside a square box. */
const seat = (i: number, r: number, count: number) => {
  const a = (seatAngle(i, count) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
};

/**
 * The wheel seats whoever the CMS returns, in the order it returns them, so
 * the geometry is computed from `seats.length` rather than a fixed five.
 *
 * Three sources meet here and none of them can be folded into another: the
 * block's own copy, the seats from the collection, and the role titles, which
 * are still dictionary translations keyed to `cms/roles.ts` because a role's
 * title belongs to the role rather than to this page. See `cms/blocks/board.ts`.
 */
export const Board = ({
  block,
  roles,
  seats,
  term,
}: {
  block: BoardBlock;
  roles: Dictionary["board"]["roles"];
  seats: Seat<BoardRole>[];
  /** The Rotary year the board serves, e.g. "2026–27". */
  term: string;
}) => {
  const members = seats.map((m) => ({
    ...m,
    photo: m.photo ?? PLACEHOLDER,
    title: roles[m.role],
    alt: fill(block.portraitAlt, { name: m.name }),
  }));
  const count = members.length;
  const step = count === 0 ? 0 : 360 / count;

  /**
   * Which seat is at the top, and how far the wheel has turned to put it
   * there. One piece of state, not two, because they are one fact.
   *
   * Held separately they drifted apart. Both were set from the same handler,
   * but `goTo` read `active` from the render it was created in while writing
   * `rotation` through an updater — so two taps inside one frame measured
   * against a stale seat, and the wheel turned by an amount that matched
   * neither. Nothing put them back in step afterwards: `prev` and `next` only
   * ever add to whatever `rotation` already held, so a single desynchronised
   * tap left the wheel permanently pointing at the wrong bust. Updating them
   * together, from the same previous value, is what makes that impossible
   * rather than unlikely.
   */
  const [seatState, setSeatState] = React.useState({ active: 0, rotation: 0 });
  const { active, rotation } = seatState;

  /** Turn by whole seats, carrying the highlight with it. */
  const turn = (delta: number) =>
    setSeatState((current) => ({
      active: count === 0 ? 0 : (current.active + delta + count) % count,
      rotation: current.rotation + delta * step,
    }));

  const prev = () => turn(-1);
  const next = () => turn(1);

  /**
   * Go to a seat the short way round.
   *
   * The old arithmetic was `i - active`, which is the distance along the array
   * rather than around the wheel: tapping seat 7 of 8 while seat 0 was up sent
   * it +315 degrees clockwise, the whole way round, instead of 45 degrees
   * back. Anything more than half a turn is shorter in the other direction.
   */
  const goTo = (i: number) =>
    setSeatState((current) => {
      if (count === 0) return current;
      const forward = (i - current.active + count) % count;
      const delta = forward > count / 2 ? forward - count : forward;
      return { active: i, rotation: current.rotation + delta * step };
    });

  const touchRef = React.useRef<{
    x: number;
    y: number;
    locked: boolean | null;
  } | null>(null);
  const swipeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;

    const onMove = (e: TouchEvent) => {
      if (!touchRef.current) return;
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      // First significant move: decide if horizontal or vertical
      if (
        touchRef.current.locked === null &&
        (Math.abs(dx) > 8 || Math.abs(dy) > 8)
      ) {
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
    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      locked: null,
    };
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
            <p className="eyebrow rise text-primary">{block.eyebrow}</p>
            <h2
              data-chars
              className="font-editorial mt-3 max-w-2xl text-balance text-4xl italic leading-[1.1] sm:text-5xl"
            >
              {block.heading}
            </h2>
          </div>
          <p className="prose-copy rise max-w-md text-sm font-light text-foreground/60">
            {block.intro}
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
                {block.arrowLabel}
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
        <div
          ref={swipeRef}
          className="sm:hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
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
              {/* the ring the members ride, arcing overhead */}
              <div className="pointer-events-none absolute inset-[4%] rounded-full border border-dashed border-foreground/25" />

              {/* members mounted on the ring */}
              {members.map((m, i) => {
                const { x, y } = seat(i, 46, count);
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
                      // 700ms and ease-out to match the wheel's own transition
                      // exactly. On 500ms the seat finished growing while the
                      // wheel was still turning, so the bust arrived at its
                      // final size a fifth of a second before its final
                      // position — which reads as a small settle just short of
                      // the end rather than as one movement.
                      className={`mx-auto overflow-hidden rounded-full border-2 shadow-[0_0_0_7px_var(--paper)] transition-all duration-700 ease-out ${
                        i === active
                          ? "h-24 w-24 border-primary ring-2 ring-primary/30"
                          : "h-14 w-14 border-foreground/20 opacity-50"
                      }`}
                    >
                      {/* 96px at its largest, on the seat the wheel has
                          turned to; 56px for the rest. `sizes` is what stops
                          the optimiser handing a 200px file to a 56px hole. */}
                      <Image
                        src={m.photo}
                        alt={m.alt}
                        width={200}
                        height={200}
                        sizes="96px"
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
              {members[active].name}
            </h3>
            <p className="eyebrow mt-1 text-foreground/55">
              {members[active].title}
            </p>

            <div className="mt-5 flex items-center justify-center gap-6">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 transition-colors hover:border-primary hover:text-primary"
                aria-label={block.prevLabel}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 12L6 8L10 4" />
                </svg>
              </button>
              <span className="eyebrow text-muted-foreground">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </span>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 transition-colors hover:border-primary hover:text-primary"
                aria-label={block.nextLabel}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
          {/* The ring the members ride. The fade lives on the wrapper and the
              turn on the svg, so the entrance and the rotation are not both
              writing to the same transform. */}
          <div data-fade className="pointer-events-none absolute inset-0">
            <svg
              viewBox="0 0 100 100"
              aria-hidden
              className="orbit-spin-slow h-full w-full"
            >
              <circle
                cx="50"
                cy="50"
                r="43"
                fill="none"
                className="stroke-foreground/30"
                strokeWidth="0.28"
                strokeDasharray="0.7 1.5"
              />
            </svg>
          </div>

          {/* Centre mark. The board serves the same Rotary year as the
              president, so the term is read off the roll rather than written
              down again here. */}
          <div
            data-fade
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <p className="font-editorial text-3xl italic leading-tight lg:text-4xl">
              {block.centreLabel}
            </p>
            <p className="eyebrow mt-2 tabular-nums text-primary">
              {shortTerm(term)}
            </p>
          </div>

          <div data-board className="absolute inset-0">
            {members.map((m, i) => {
              const { x: left, y: top } = seat(i, 43, count);
              return (
                <article
                  key={m.role}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  className="group absolute w-36 -mt-16 -translate-x-1/2 text-center lg:w-40 lg:-mt-18"
                >
                  {/* the paper halo knocks the orbit line out behind each bust */}
                  <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border border-foreground/20 shadow-[0_0_0_9px_var(--paper)] ring-1 ring-transparent transition-all duration-500 group-hover:border-primary group-hover:ring-primary/40 lg:h-36 lg:w-36">
                    <Image
                      src={m.photo}
                      alt={m.alt}
                      width={400}
                      height={400}
                      sizes="144px"
                      className="board-photo h-full w-full object-cover group-hover:scale-105 group-hover:[filter:grayscale(0)_contrast(1.05)_brightness(1)]"
                    />
                  </div>
                  {/* Cased rather than backed by a panel: a field big enough
                      to clear the orbit line would also lie across the wheel. */}
                  <h3 className="font-editorial paper-cased mt-3 text-lg italic leading-tight transition-colors group-hover:text-primary">
                    {m.name}
                  </h3>
                  <p className="eyebrow paper-cased mt-1 text-xs text-foreground/55">
                    {m.title}
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
