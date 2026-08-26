"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/Wordmark";
import { signOut } from "../_actions/auth";

const LINKS = [
  { href: "/uye", label: "Panel" },
  { href: "/uye/duyurular", label: "Duyurular" },
  { href: "/uye/etkinlikler", label: "Etkinlikler" },
  { href: "/uye/rehber", label: "Rehber" },
] as const;

const BOARD_LINK = { href: "/uye/yonetim", label: "Yönetim" } as const;

export function MembersNav({
  name,
  isBoard,
}: {
  name: string;
  isBoard: boolean;
}) {
  const pathname = usePathname();
  // Hiding the link is presentation, not access control — `/uye/yonetim`
  // turns an ordinary member away on its own.
  const links = isBoard ? [...LINKS, BOARD_LINK] : LINKS;

  return (
    <header className="relative z-20 border-b border-foreground/15">
      <div className="wrapper flex h-16 items-center justify-between gap-4">
        {/* Back out to the public site: the wordmark means the same thing on
            both halves, so it should not start meaning "dashboard" here. */}
        <Wordmark
          href="/tr"
          src="/dokuz_eylul.png"
          alt="Dokuz Eylül Rotaract Kulübü"
          priority
          className="w-(--masthead-logo-parked) shrink-0"
        />

        <nav aria-label="Üye alanı" className="hidden gap-6 md:flex">
          {links.map(({ href, label }) => {
            const active =
              href === "/uye" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`eyebrow transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-foreground/55 sm:inline">
            {name}
          </span>
          <span aria-hidden className="hidden h-4 w-px bg-foreground/20 sm:inline-block" />
          <form action={signOut}>
            <button
              type="submit"
              className="eyebrow text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Çıkış
            </button>
          </form>
        </div>
      </div>

      {/* The nav is the only way around on a phone, so it stays visible rather
          than folding into a menu the way the public site's does. */}
      <nav
        aria-label="Üye alanı"
        className="wrapper flex gap-5 overflow-x-auto pb-3 md:hidden"
      >
        {links.map(({ href, label }) => {
          const active =
            href === "/uye" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`eyebrow shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
