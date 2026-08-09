import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rotaract",
  description: "Rotaract Club",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${openSans.className} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
