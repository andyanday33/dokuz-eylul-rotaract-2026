import Image from "next/image";
import Link from "next/link";

/**
 * The club's wordmark, as a link.
 *
 * Both the home page's travelling logo and the standalone pages' masthead
 * render this, so the two cannot drift apart in size, alt text or hover
 * treatment. The size itself comes from `--masthead-logo-parked`, which the
 * hero's animation also reads for the end of its travel.
 */
export function Wordmark({
  href,
  src,
  alt,
  className = "",
  priority = false,
}: {
  href: string;
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const inner = (
    <Image
      src={src}
      alt={alt}
      width={790}
      height={318}
      // The masthead runs from 16rem to 42rem while the hero animation plays
      // and parks at 6.5rem for the rest of the site. Without this every one
      // of those states pulled the 790w file.
      sizes="(min-width: 1280px) 42rem, (min-width: 1024px) 36rem, (min-width: 768px) 30rem, (min-width: 640px) 24rem, 18rem"
      priority={priority}
      className="h-auto w-full"
    />
  );

  const style =
    "block transition-opacity duration-300 hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none";

  // A hash is a jump within the page the wordmark already sits on; routing it
  // through the router would be pretending it is a navigation.
  return href.startsWith("#") ? (
    <a href={href} className={`${style} ${className}`}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={`${style} ${className}`}>
      {inner}
    </Link>
  );
}
