import type { Metadata } from "next";
import { LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { bodoni, openSans } from "@/lib/fonts";
import { SITE_ORIGIN } from "@/lib/seo";
import "../../globals.css";

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return {
    // Set once here so every page below can give Open Graph a relative URL
    // and still emit the absolute one those tags require.
    metadataBase: new URL(SITE_ORIGIN),
    title: meta.title,
    description: meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <html
      lang={await getLocale()}
      className={`${openSans.className} ${bodoni.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
