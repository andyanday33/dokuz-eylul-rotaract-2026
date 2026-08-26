/**
 * The masthead every members page opens with — eyebrow, rule, editorial title.
 * The same rhythm the public site's standalone pages use, so the private half
 * reads as the same publication rather than as a dashboard bolted on.
 */
export function SectionHeading({
  label,
  title,
  meta,
  intro,
}: {
  label: string;
  title: string;
  meta?: string;
  intro?: string;
}) {
  return (
    <header className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-4">
        <p className="eyebrow text-primary">{label}</p>
        {meta && (
          <p className="eyebrow tabular-nums text-foreground/45">{meta}</p>
        )}
      </div>

      <h1 className="font-editorial mt-8 text-4xl italic leading-[1.05] sm:text-5xl lg:text-6xl">
        {title}
      </h1>

      {intro && (
        <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-foreground/65">
          {intro}
        </p>
      )}
    </header>
  );
}

/** Shown where a list has nothing in it yet, which is most of them at launch. */
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-foreground/15 pl-4 text-sm font-light text-foreground/50">
      {children}
    </p>
  );
}
