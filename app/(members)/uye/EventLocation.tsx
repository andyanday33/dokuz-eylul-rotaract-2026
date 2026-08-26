/**
 * Where an event is: the address the board typed, the map link they pasted, or
 * both — in which case the address itself is the link rather than growing a
 * second control beside it. One line, one job.
 *
 * No pin or arrow glyph. The members area says "go" with `→` on its own
 * internal links, and borrowing it here would make an address look like
 * navigation; a plain underline already reads as a link in any language.
 */
export function EventLocation({
  location,
  mapUrl,
  className = "mt-2 text-sm font-light text-foreground/60",
}: {
  location: string | null;
  mapUrl: string | null;
  className?: string;
}) {
  if (!location && !mapUrl) return null;

  const link =
    "underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <p className={className}>
      {mapUrl ? (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          {/* A link with no address to name it has to say what it opens. */}
          {location ?? "Haritada aç"}
        </a>
      ) : (
        location
      )}
    </p>
  );
}
