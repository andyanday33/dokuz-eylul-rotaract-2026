import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollAnimations } from "@/components/ScrollAnimations";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { HOME_PATH } from "@/cms/home";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getPage } from "@/lib/cms/queries";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import type { Metadata } from "next";

/**
 * The home page, assembled from the same blocks as every other page.
 *
 * It used to name its sections in source, in a fixed order. It cannot any
 * more: the moment a section's copy moved into a block, the copy had an owner
 * — the page document — and a hand-written page had nowhere to read it from.
 * Keeping both would have meant two sources for one sentence, which is the
 * thing a CMS is supposed to end.
 *
 * If the `home` document is missing this 404s rather than falling back to
 * something. A silent fallback would hide a deleted home page behind a page
 * that looks nearly right, and the club would find out slowly.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [dict, page] = await Promise.all([
    getDictionary(),
    getPage(HOME_PATH, locale),
  ]);
  if (!page) return {};
  return pageMetadata({
    locale,
    title: page.title,
    description: page.description,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
    noindex: page.noindex,
    siteName: dict.meta.title,
  });
}

export default async function Home() {
  const locale = await getLocale();
  const [dict, page] = await Promise.all([
    getDictionary(),
    getPage(HOME_PATH, locale),
  ]);
  if (!page) notFound();

  return (
    <main className="flex flex-col relative">
      <JsonLd
        locale={locale}
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
