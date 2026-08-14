"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const NAV_LINKS = [
  { href: "#hakkimizda", label: "Hakkımızda" },
  { href: "#projeler", label: "Projeler" },
  { href: "#etkinlikler", label: "Etkinlikler" },
  { href: "#iletisim", label: "İletişim" },
];

export const Navbar = () => {
  useGSAP(() => {
    gsap.to(".navbar", {
      backgroundColor:
        "color-mix(in oklab, var(--background) 96%, transparent)",
      borderBottomColor: "var(--border)",
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
        <ul className="flex items-center gap-7">
          {NAV_LINKS.map((l) => (
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
      </nav>
    </header>
  );
};
