import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/i18n/config";

/**
 * The site's own origin, for the absolute URLs that social cards and
 * structured data require.
 *
 * Read from the environment rather than from the request, deliberately.
 * `lib/site-url.ts` derives it from headers, which is right for an email link
 * but would opt every page out of static rendering the moment `generateMetadata`
 * touched it. These pages are prerendered; their canonical URL has to be known
 * at build time, which means it has to be configured.
 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** An absolute URL for a path under a locale — `("tr", "projeler")`. */
export const absoluteUrl = (locale: Locale, path = "") =>
  `${SITE_ORIGIN}/${locale}${path ? `/${path.replace(/^\/+/, "")}` : ""}`;

type PageSeo = {
  locale: Locale;
  /** Address under the locale segment; empty for the home page. */
  path?: string;
  title: string;
  description?: string | null;
  /** Overrides for the social card only. */
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: { url?: string | null; alt?: string | null } | null;
  noindex?: boolean | null;
  siteName: string;
};

/**
 * One page's metadata: canonical, hreflang, Open Graph, Twitter, robots.
 *
 * The same document answers at `/tr/...` and `/en/...`, so every page declares
 * both as alternates and itself as canonical. Without that a search engine has
 * to guess whether the two are duplicates of each other or separate pages, and
 * it usually guesses that one of them should be dropped.
 */
export const pageMetadata = ({
  locale,
  path = "",
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  noindex,
  siteName,
}: PageSeo): Metadata => {
  const url = absoluteUrl(locale, path);
  const summary = ogDescription || description || undefined;
  const image = ogImage?.url
    ? [
        {
          url: new URL(ogImage.url, SITE_ORIGIN).toString(),
          alt: ogImage.alt ?? title,
        },
      ]
    : undefined;

  return {
    title,
    description: description ?? undefined,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, absoluteUrl(l, path)]),
      ),
    },
    openGraph: {
      type: "website",
      siteName,
      locale,
      title: ogTitle || title,
      description: summary,
      url,
      images: image,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: ogTitle || title,
      description: summary,
      images: image,
    },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          // Let search engines and answer engines quote the page in full
          // rather than truncating it to a fragment.
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
  };
};
