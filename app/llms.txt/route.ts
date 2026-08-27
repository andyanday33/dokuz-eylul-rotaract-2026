import { LOCALES } from "@/i18n/config";
import { dictionaryFor } from "@/i18n/dictionaries";
import { getListablePages, getPresidents } from "@/lib/cms/queries";
import { absoluteUrl, SITE_ORIGIN } from "@/lib/seo";
import { rollSpan } from "@/lib/presidents";

/**
 * `/llms.txt` — a plain-markdown map of the site for language models.
 *
 * A convention rather than a standard: models and their crawlers read a lot of
 * navigation and animation markup to find very little prose, and this is the
 * short version. Generated from the CMS on every request, so it cannot drift
 * from the site the way a hand-written file would.
 *
 * `noindex` pages are left out, on the same reasoning as the sitemap: a page
 * the club has kept out of search should not be announced here either.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  // Written in Turkish, the club's own language, with the English titles
  // listed alongside so a model reading either finds the same pages.
  const [tr, pagesTr, pagesEn, roll] = await Promise.all([
    dictionaryFor("tr"),
    getListablePages("tr"),
    getListablePages("en"),
    getPresidents(),
  ]);

  const titleFor = (path: string, locale: (typeof LOCALES)[number]) =>
    (locale === "tr" ? pagesTr : pagesEn).find((p) => p.path === path);

  const lines: string[] = [
    `# ${tr.meta.title}`,
    "",
    `> ${tr.meta.description}`,
    "",
    `Dokuz Eylül Rotaract Kulübü, Rotary International'a bağlı bir gençlik kulübüdür — ${tr.nav.place}. ${rollSpan(roll)} arasında ${roll.length} dönem başkanı görev yapmıştır.`,
    "",
    `İletişim: ${tr.contact.email}`,
    "",
    "Site iki dilde yayımlanır: Türkçe (`/tr`) ve İngilizce (`/en`). Aynı sayfa iki adreste aynı içeriği taşır.",
    "",
    "## Sayfalar",
    "",
  ];

  for (const { path, title, description } of pagesTr) {
    const en = titleFor(path, "en");
    for (const locale of LOCALES) {
      const name = locale === "tr" ? title : (en?.title ?? title);
      const summary = locale === "tr" ? description : (en?.description ?? description);
      lines.push(
        `- [${name}](${absoluteUrl(locale, path === "home" ? "" : path)})${summary ? `: ${summary}` : ""}`,
      );
    }
  }

  for (const locale of LOCALES) {
    const d = locale === "tr" ? tr : await dictionaryFor("en");
    lines.push(
      `- [${d.presidents.pageTitle}](${absoluteUrl(locale, "presidents")}): ${
        locale === "tr"
          ? "Kulübün kuruluşundan bugüne bütün dönem başkanları."
          : "Every club president from the founding to today."
      }`,
    );
  }

  lines.push(
    "",
    "## Başkanlar",
    "",
    `Kulübün dönem başkanları listesi, en yenisi başta:`,
    "",
    ...roll.slice(0, 10).map(({ term, name }) => `- ${term} — ${name}`),
    ...(roll.length > 10 ? [`- …ve ${roll.length - 10} dönem daha`] : []),
    "",
    `Tam liste: ${absoluteUrl("tr", "presidents")}`,
    "",
    "## Notlar",
    "",
    `- Site haritası: ${SITE_ORIGIN}/sitemap.xml`,
    "- Sayfa içerikleri Payload CMS'ten gelir; bu dosya her istekte yeniden üretilir.",
    "",
  );

  return new Response(lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n", {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
