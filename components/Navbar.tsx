"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Dictionary } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SiteMenu } from "./SiteMenu";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const Navbar = ({
  nav,
  email,
  place,
}: {
  nav: Dictionary["nav"];
  email: string;
  place: string;
}) => {
  useGSAP(() => {
    gsap.to(".navbar", {
      backgroundColor: "color-mix(in oklab, var(--paper) 92%, transparent)",
      borderBottomColor: "color-mix(in oklab, var(--foreground) 15%, transparent)",
      backdropFilter: "blur(12px)",
      scrollTrigger: {
        trigger: "#hero",
        start: "80% top",
        toggleActions: "play none none reverse",
      },
    });
  });

  return (
    <header className="fixed navbar inset-x-0 top-0 z-40 border-b border-transparent">
      <nav className="wrapper flex h-16 items-center justify-between">
        <div className="h-7 w-[176px]" aria-hidden />
        <div className="flex items-center gap-5 sm:gap-7">
          <ul className="hidden items-center gap-6 xl:flex">
            {nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="eyebrow text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {/* Hairline rule, as between columns of a masthead */}
          <span aria-hidden className="hidden h-4 w-px bg-foreground/20 xl:block" />
          <LanguageSwitcher label={nav.languageLabel} />
          {/* Hairline rule, mirroring the one before the switcher */}
          <span aria-hidden className="h-4 w-px bg-foreground/20 xl:hidden" />
          <SiteMenu nav={nav} email={email} place={place} />
        </div>
      </nav>
    </header>
  );
};
