import type { Metadata } from "next";
import { Open_Sans, Bodoni_Moda } from "next/font/google";
import { LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import "../globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.title, description: meta.description };
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
