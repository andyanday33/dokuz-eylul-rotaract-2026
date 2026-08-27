import type { Locale } from "@/i18n/config";
import { SITE_ORIGIN, absoluteUrl } from "@/lib/seo";

/**
 * schema.org markup, as a `@graph` of the club and the page being read.
 *
 * Derived rather than authored: everything here already exists as content, and
 * a second hand-maintained copy of the club's name and address is a copy that
 * goes stale. There is deliberately no CMS field behind any of it.
 *
 * This is what Google's rich results read, and what the answer engines —
 * ChatGPT search, Perplexity, Gemini — parse when deciding what a page is
 * about. Prose tells them what the club says; this tells them what it *is*.
 */
export const JsonLd = ({
  locale,
  path = "",
  title,
  description,
  siteName,
  logoUrl,
  email,
  areaServed,
}: {
  locale: Locale;
  path?: string;
  title: string;
  description?: string | null;
  siteName: string;
  logoUrl?: string | null;
  email?: string;
  areaServed?: string;
}) => {
  const org = `${SITE_ORIGIN}/#organization`;
  const site = `${SITE_ORIGIN}/#website`;
  const url = absoluteUrl(locale, path);

  const graph = [
    {
      "@type": "Organization",
      "@id": org,
      name: siteName,
      url: SITE_ORIGIN,
      ...(logoUrl
        ? { logo: new URL(logoUrl, SITE_ORIGIN).toString() }
        : undefined),
      ...(email ? { email } : undefined),
      ...(areaServed ? { areaServed } : undefined),
      // Rotaract clubs are chartered by Rotary International; saying so is
      // what distinguishes this from any other club with a similar name.
      parentOrganization: {
        "@type": "Organization",
        name: "Rotary International",
        url: "https://www.rotary.org",
      },
    },
    {
      "@type": "WebSite",
      "@id": site,
      url: SITE_ORIGIN,
      name: siteName,
      inLanguage: locale,
      publisher: { "@id": org },
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      ...(description ? { description } : undefined),
      inLanguage: locale,
      isPartOf: { "@id": site },
      about: { "@id": org },
    },
  ];

  return (
    <script
      type="application/ld+json"
      // The payload is built here from typed values, not from anything a
      // visitor supplies. `<` is still escaped, because a `</script>` landing
      // inside a string would close this tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
};
