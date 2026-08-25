// Shared editorial-broadsheet primitives used across every section so the
// whole site reads as one printed publication: paper + ink grounds, film
// grain, and a newspaper-style nameplate header.

// Fractal-noise tooth, inlined as a data URI (no network request).
export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Grain overlay — multiplies into paper, overlays onto ink. */
export function Grain({ variant = "paper" }: { variant?: "paper" | "ink" }) {
  return (
    <div
      aria-hidden
      style={{ backgroundImage: GRAIN }}
      className={
        variant === "ink"
          ? "pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
          : "pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-multiply"
      }
    />
  );
}

/** Aged-paper vignette — darkens the top edges like old newsprint. */
export function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_-10%,transparent_55%,color-mix(in_oklab,var(--foreground)_12%,transparent)_100%)]"
    />
  );
}

/**
 * Newspaper nameplate: numbered eyebrow + optional dateline, ruled below.
 *
 * `tone` names the ground it sits on. It matters for more than taste: the
 * label is cranberry by default, which disappears on a ground from the
 * cranberry family, so the ground has to be declared rather than assumed.
 */
export function Nameplate({
  index,
  label,
  meta,
  metaLang,
  tone = "paper",
}: {
  index: string;
  label: string;
  meta?: string;
  /** Language of `meta` when it is not the page's own — `uppercase` cases by
      language, so Turkish left undeclared on an English page loses its İ. */
  metaLang?: string;
  tone?: "paper" | "ink" | "wine";
}) {
  const rule = {
    paper: "border-foreground",
    ink: "border-paper/80",
    wine: "border-paper/70",
  }[tone];

  // Cranberry reads on paper and on ink, but vanishes on a ground from its
  // own family, so wine takes a light label instead.
  const labelInk = tone === "wine" ? "text-paper" : "text-primary";

  const metaInk = {
    paper: "text-foreground/45",
    ink: "text-paper/45",
    wine: "text-paper/75",
  }[tone];

  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-3 border-b-2 pb-4 ${rule}`}
    >
      <p className={`eyebrow rise ${labelInk}`}>
        {index} — {label}
      </p>
      {meta ? (
        <p lang={metaLang} className={`eyebrow rise ${metaInk}`}>
          {meta}
        </p>
      ) : null}
    </div>
  );
}
