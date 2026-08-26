import type { Metadata } from "next";
import { bodoni, openSans } from "@/lib/fonts";
import "../globals.css";

/**
 * The members area's own root layout.
 *
 * A second root layout rather than a branch of the public one, because the two
 * halves genuinely disagree about the basics: this one has no locale segment
 * and no dictionary — the club's internal life happens in Turkish, and
 * translating meeting notes into English is work nobody would keep up.
 *
 * Moving between the halves is a full page load. That is the correct cost for
 * crossing from a public shop window into a private room.
 */
export const metadata: Metadata = {
  title: "Üye alanı — Dokuz Eylül Rotaract Kulübü",
  // Nothing here should ever turn up in a search result, including the login
  // page, which would otherwise be the one indexable door into the area.
  robots: { index: false, follow: false },
};

export default function MembersRootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${openSans.className} ${bodoni.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-paper text-foreground">
        {children}
      </body>
    </html>
  );
}
