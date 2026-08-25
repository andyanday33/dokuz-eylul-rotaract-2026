import React from "react";

/**
 * The Rotary wheel, drawn to spec rather than approximated: 24 cogs, 6 spokes,
 * and a keyway cut into the hub — the keyway being the detail added in 1923 so
 * the wheel would read as a working gear rather than an ornament.
 *
 * Rendered as a draughtsman's plate (hairline ink, cranberry construction
 * lines, no filled badge) so it sits inside the paper-and-ink editorial
 * language instead of dropping a logo lockup into the middle of the page.
 *
 * Geometry lives in a 1000×1000 field so every radius below is readable as
 * "units from centre"; the SVG scales to whatever box it is given.
 */

const C = 500;
const TEETH = 24;
const PITCH = 360 / TEETH; // 15° of arc per cog

/** Radii, outermost first. */
const R = {
  tip: 492, // cog tips
  pitch: 468, // pitch circle (construction only)
  root: 444, // cog roots / rim outer edge
  band: 398, // baseline of the rim mark; glyphs rise outward from here
  rim: 372, // rim inner edge
  hub: 158,
  key: 130, // keyway slot reaches this far out of the bore
  bore: 86,
};

/** Cogs taper slightly from root to tip, as a cast gear tooth does. */
const TOOTH_TIP = 3.4;
const TOOTH_ROOT = 4.8;

/** 0° is twelve o'clock, increasing clockwise — matches how the wheel turns. */
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const pt = (r: number, deg: number) =>
  `${(C + r * Math.cos(rad(deg))).toFixed(2)} ${(C + r * Math.sin(rad(deg))).toFixed(2)}`;

/** One closed outline walking root → tip → tip → root, 24 times around. */
const COGS = (() => {
  let d = `M ${pt(R.root, -TOOTH_ROOT)}`;
  for (let i = 0; i < TEETH; i++) {
    const a = i * PITCH;
    d += ` L ${pt(R.tip, a - TOOTH_TIP)}`;
    d += ` A ${R.tip} ${R.tip} 0 0 1 ${pt(R.tip, a + TOOTH_TIP)}`;
    d += ` L ${pt(R.root, a + TOOTH_ROOT)}`;
    d += ` A ${R.root} ${R.root} 0 0 1 ${pt(R.root, a + PITCH - TOOTH_ROOT)}`;
  }
  return `${d} Z`;
})();

/** Counter-wound circle, appended to COGS so even-odd fill leaves a rim band. */
const circleSub = (r: number) =>
  `M ${C - r} ${C} A ${r} ${r} 0 1 0 ${C + r} ${C} A ${r} ${r} 0 1 0 ${C - r} ${C} Z`;

/**
 * Spokes sit at 30° intervals offset from vertical, which leaves twelve
 * o'clock clear for the keyway — the arrangement on the official emblem.
 */
const SPOKES = [30, 90, 150, 210, 270, 330];

const SPOKE_END = 38; // half-width where it meets hub and rim
const SPOKE_WAIST = 28; // control point pulls the flanks in at mid-span

/**
 * Drawn pointing up from the origin; each instance is rotated into place.
 * Both ends bite two units into hub and rim: enough that no hairline gap
 * opens up, little enough that the doubled fill doesn't show as a patch.
 */
const SPOKE_Y0 = -(R.hub - 2);
const SPOKE_Y1 = -(R.rim + 2);
const SPOKE_YM = (SPOKE_Y0 + SPOKE_Y1) / 2;

const SPOKE_BODY =
  `M ${-SPOKE_END} ${SPOKE_Y0} Q ${-SPOKE_WAIST} ${SPOKE_YM} ${-SPOKE_END} ${SPOKE_Y1}` +
  ` L ${SPOKE_END} ${SPOKE_Y1} Q ${SPOKE_WAIST} ${SPOKE_YM} ${SPOKE_END} ${SPOKE_Y0} Z`;

/**
 * Only the two flanks, as open subpaths. Stroking the closed body instead
 * would cap each end with a chord straight across the hub and rim circles.
 */
const SPOKE_FLANKS =
  `M ${-SPOKE_END} ${SPOKE_Y0} Q ${-SPOKE_WAIST} ${SPOKE_YM} ${-SPOKE_END} ${SPOKE_Y1}` +
  ` M ${SPOKE_END} ${SPOKE_Y0} Q ${SPOKE_WAIST} ${SPOKE_YM} ${SPOKE_END} ${SPOKE_Y1}`;

/**
 * The rim mark runs the whole way round, so there is no "right way up" to get
 * wrong as the wheel turns — it reads as a struck seal at any angle.
 *
 * Wound clockwise from twelve o'clock, which stands the glyphs up along the
 * top of the band (and inverts them along the bottom, as any seal does).
 */
const BAND_FONT = 28;
const BAND_PATH =
  `M ${C} ${C - R.band} A ${R.band} ${R.band} 0 0 1 ${C} ${C + R.band}` +
  ` A ${R.band} ${R.band} 0 0 1 ${C} ${C - R.band}`;
const BAND_LENGTH = 2 * Math.PI * R.band;

/**
 * Repeat the phrase as many times as fits at roughly the tracking the rest of
 * the site sets small caps at, then let textLength stretch the spacing to
 * exactly one circumference. Pinning the run to the full circle is what makes
 * the wrap seamless: the last glyph lands where the first begins.
 */
const bandRepeats = (phrase: string) =>
  Math.max(2, Math.round(BAND_LENGTH / (phrase.length * BAND_FONT * 0.87)));

/** Bore plus the keyway notch cut squarely out of its top. */
const BORE = (() => {
  const half = 28;
  const y = -Math.sqrt(R.bore ** 2 - half ** 2); // where the slot walls meet the bore
  return `M ${half} ${y.toFixed(2)} A ${R.bore} ${R.bore} 0 1 1 ${-half} ${y.toFixed(2)} L ${-half} ${-R.key} L ${half} ${-R.key} Z`;
})();

export const RotaryWheel = ({
  className = "",
  mark,
}: {
  className?: string;
  /** Repeated end-to-end around the rim band. Include its own separator. */
  mark?: string;
}) => {
  const bandId = `rw-band-${React.useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 1000 1000"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* ---- material: everything that is cast metal, no linework ---- */}
      <g data-fade>
        <path
          d={`${COGS} ${circleSub(R.rim)}`}
          fillRule="evenodd"
          className="fill-primary/8"
        />
        <g transform={`translate(${C} ${C})`}>
          {SPOKES.map((a) => (
            <path
              key={a}
              d={SPOKE_BODY}
              transform={`rotate(${a})`}
              className="fill-primary/8"
            />
          ))}
          <circle r={R.hub} className="fill-primary/14" />
          <path d={BORE} className="fill-paper" />
        </g>
      </g>

      {/* ---- construction lines: what a draughtsman leaves on the plate ---- */}
      <g data-fade>
        <circle
          cx={C}
          cy={C}
          r={R.pitch}
          className="stroke-primary/45"
          strokeWidth={1.5}
          strokeDasharray="5 11"
        />
        {/* root ticks, one per cog gap, kept short to clear the rim mark */}
        <g className="stroke-foreground/30" strokeWidth={2}>
          {Array.from({ length: TEETH }, (_, i) => {
            const a = i * PITCH + PITCH / 2;
            return (
              <path key={i} d={`M ${pt(R.rim, a)} L ${pt(R.rim + 12, a)}`} />
            );
          })}
        </g>
        {/* centre mark */}
        <g className="stroke-primary/50" strokeWidth={2}>
          <path d={`M ${C - 26} ${C} L ${C + 26} ${C}`} />
          <path d={`M ${C} ${C - 26} L ${C} ${C + 26}`} />
        </g>
      </g>

      {/* ---- linework: drawn on in sequence, outside in ---- */}
      <path
        data-draw="cogs"
        d={COGS}
        className="stroke-foreground/70"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <circle
        data-draw="rim"
        cx={C}
        cy={C}
        r={R.rim}
        className="stroke-foreground/70"
        strokeWidth={3}
      />
      <g transform={`translate(${C} ${C})`}>
        {SPOKES.map((a) => (
          <path
            key={a}
            data-draw="spoke"
            d={SPOKE_FLANKS}
            transform={`rotate(${a})`}
            className="stroke-foreground/60"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))}
        <circle
          data-draw="hub"
          r={R.hub}
          className="stroke-foreground/70"
          strokeWidth={3}
        />
        {/* the keyway, picked out in cranberry — the one place the brand lands */}
        <path
          data-draw="hub"
          d={BORE}
          className="stroke-primary/80"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </g>

      {/* ---- the rim mark, repeating the whole way round ---- */}
      {mark ? (
        <>
          <defs>
            <path id={bandId} d={BAND_PATH} />
          </defs>
          <text
            data-fade
            className="fill-foreground/55"
            style={{ fontWeight: 700, fontSize: BAND_FONT }}
          >
            <textPath
              href={`#${bandId}`}
              startOffset="0"
              textLength={BAND_LENGTH.toFixed(2)}
              lengthAdjust="spacing"
            >
              {mark.repeat(bandRepeats(mark))}
            </textPath>
          </text>
        </>
      ) : null}
    </svg>
  );
};
