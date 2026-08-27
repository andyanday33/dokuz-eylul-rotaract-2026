import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollAnimations } from "@/components/ScrollAnimations";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getPage, getPagePaths } from "@/lib/cms/queries";
import { HOME_PATH } from "@/cms/home";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { LOCALES } from "@/i18n/config";

/**
 * Anything the page builder has made.
 *
 * A catch-all under the locale segment, so `/tr/projeler` and `/en/projeler`
 * are the same document read in two languages. It sits underneath the routes
 * the app owns outright — `/[lang]/presidents` is a static segment and wins
 * over this one, so a page created at that address is unreachable rather than
 * conflicting. That is the right way round: the code's routes are the ones
 * with behaviour behind them.
 *
 * Navbar, footer and the scroll rig are not blocks. They are the frame every
 * page of the public site shares, and offering them in the builder would let
 * someone build a page without a way out of it.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const paths = (await getPagePaths()).filter((path) => path !== HOME_PATH);
  return LOCALES.flatMap((lang) =>
    paths.map((path) => ({ lang, path: path.split("/") })),
  );
}

/**
 * The home page is a page document too, but it answers at `/tr`, not at
 * `/tr/home`. Refusing its path here keeps one page from having two addresses.
 */
const read = async (params: Promise<{ path: string[] }>) => {
  const path = (await params).path.join("/");
  if (path === HOME_PATH) return null;
  return getPage(path, await getLocale());
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/[...path]">): Promise<Metadata> {
  const page = await read(params);
  if (!page) return {};
  const [{ meta }, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata({
    locale,
    path: (await params).path.join("/"),
    title: `${page.title} — ${meta.title}`,
    description: page.description ?? meta.description,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
    noindex: page.noindex,
    siteName: meta.title,
  });
}

export default async function BuiltPage({
  params,
}: PageProps<"/[lang]/[...path]">) {
  const page = await read(params);
  if (!page) notFound();

  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <main className="flex flex-col relative">
      <JsonLd
        locale={locale}
        path={(await params).path.join("/")}
        title={page.title}
        description={page.description}
        siteName={dict.meta.title}
        logoUrl={dict.wordmark.src}
        email={dict.contact.email}
        areaServed={dict.nav.place}
      />
      <Navbar nav={dict.nav} email={dict.contact.email} place={dict.nav.place} />
      <RenderBlocks layout={page.layout} />
      <Footer />
      <ScrollAnimations />
    </main>
  );
}
