"use client";

import { usePathname } from "next/navigation";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  withLocale,
  type Locale,
} from "@/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Set in the browser rather than by the destination page so the choice is
 * recorded even when the target route is served straight from the static
 * cache — `proxy.ts` reads it back the next time a visitor lands on `/`.
 */
const remember = (locale: Locale) => {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${ONE_YEAR};samesite=lax`;
};

/**
 * Struck like a masthead byline: TR / EN, the live one in cranberry.
 *
 * Plain anchors, not `next/link`: GSAP's SplitText rewrites the headings into
 * per-character spans behind React's back, so a soft navigation would patch
 * new copy into DOM React no longer owns and leave every ScrollTrigger
 * measured against the old text. A document load re-runs the whole timeline
 * from a clean page, which is what the animations already assume.
 */
export const LanguageSwitcher = ({ label }: { label: string }) => {
  const pathname = usePathname();
  const current = pathname.split("/")[1];

  // `group` rather than a bare div: the two locale links are a set of related
  // controls, and `generic` — what a div is — cannot carry the name that tells
  // anyone what the set is for. A second `nav` landmark would also take the
  // label, but this already sits inside the masthead's nav, and nesting one
  // landmark inside another is noise.
  return (
    <div
      role="group"
      aria-label={label}
      className="eyebrow flex items-center gap-2 text-muted-foreground"
    >
      {LOCALES.map((locale, i) => {
        const active = locale === current;
        return (
          <span key={locale} className="flex items-center gap-2">
            {i > 0 ? (
              <span aria-hidden className="text-foreground/25">
                /
              </span>
            ) : null}
            <a
              href={withLocale(pathname, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={active ? "true" : undefined}
              onClick={() => remember(locale)}
              className={`${
                active
                  ? "text-primary underline decoration-primary/50 underline-offset-4"
                  : "transition-colors hover:text-primary"
              } focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
            >
              <span aria-hidden>{LOCALE_LABELS[locale].short}</span>
              <span className="sr-only">{LOCALE_LABELS[locale].name}</span>
            </a>
          </span>
        );
      })}
    </div>
  );
};
