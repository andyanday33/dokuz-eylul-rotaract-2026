import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { getListablePages } from "@/lib/cms/queries";
import { absoluteUrl } from "@/lib/seo";
import { HOME_PATH } from "@/cms/home";

/**
 * Every public address, both languages, with each declaring the other as its
 * alternate — the same hreflang pairing the pages themselves carry.
 *
 * Built from the CMS rather than a list in source, so a page created in the
 * panel is in the sitemap without a deploy. `noindex` pages are excluded by
 * `getListablePages`, and the home page appears as `/tr` and `/en` rather than
 * at its reserved `home` path, which is not an address the site answers on.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getListablePages("tr");
  const address = (path: string) => (path === HOME_PATH ? "" : path);

  const entries: MetadataRoute.Sitemap = pages.flatMap(({ path }) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(locale, address(path)),
      changeFrequency: "monthly" as const,
      priority: path === HOME_PATH ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, absoluteUrl(l, address(path))]),
        ),
      },
    })),
  );

  // A hand-written route, so it is not in the pages collection.
  entries.push(
    ...LOCALES.map((locale) => ({
      url: absoluteUrl(locale, "presidents"),
      changeFrequency: "yearly" as const,
      priority: 0.5,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, absoluteUrl(l, "presidents")]),
        ),
      },
    })),
  );

  return entries;
}
