"use client";

import Link from "next/link";
import React from "react";
import type { Dictionary } from "@/i18n/config";
import { Grain } from "./Editorial";

/**
 * Navigation for phones and tablets, where the masthead has no room for the
 * links. It is a native <dialog> opened with showModal(), so the focus trap,
 * Escape-to-close, background inertness and focus restoration all come from
 * the platform rather than from JavaScript that has to be kept correct.
 *
 * The destinations are set at the same scale as the section headings they lead
 * to, so opening the menu reads as the page announcing its own contents.
 */
export const SiteMenu = ({
  nav,
  email,
  place,
}: {
  nav: Dictionary["nav"];
  /** The club's address, shown at the foot of the menu. Real, and reachable. */
  email: string;
  /** "Dokuz Eylül · İzmir" — Turkish in both locales, hence the lang below. */
  place: string;
}) => {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const dismiss = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  // Resizing up to desktop hides the trigger; without this the dialog would
  // stay modal with nothing visible to dismiss it.
  React.useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const close = () => wide.matches && dialog.current?.close();
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);

  const follow = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    dialog.current?.close();
    document.querySelector(href)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          dialog.current?.showModal();
          // showModal leaves focus on <body> here; put it on the dismiss
          // control so the dialog is announced and reachable straight away.
          dismiss.current?.focus();
          setOpen(true);
        }}
        aria-expanded={open}
        aria-controls="site-menu"
        className="eyebrow flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary xl:hidden"
      >
        {nav.menu}
        <span aria-hidden className="relative block h-3.5 w-5">
          <span className="absolute inset-x-0 top-0.5 h-px bg-current" />
          <span className="absolute inset-x-0 bottom-0.5 h-px bg-current" />
        </span>
      </button>

      <dialog
        ref={dialog}
        id="site-menu"
        aria-label={nav.menu}
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-paper p-0 text-foreground backdrop:bg-ink/50"
      >
        <div className="relative flex h-full flex-col overflow-y-auto overscroll-contain">
          <Grain />

          <div className="wrapper relative z-10 flex h-16 shrink-0 items-center justify-end">
            <button
              ref={dismiss}
              type="button"
              onClick={() => dialog.current?.close()}
              className="eyebrow flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {nav.menuClose}
              <span aria-hidden className="relative block size-4">
                <span className="absolute inset-x-0 top-1/2 h-px rotate-45 bg-current" />
                <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <nav className="wrapper relative z-10 flex flex-1 flex-col justify-center py-10 pb-[7vh]">
            <ul>
              {nav.links.map((l, i) => (
                <li
                  key={l.href}
                  className="menu-rise border-t border-foreground/15 last:border-b"
                  style={{ animationDelay: `${60 + i * 55}ms` }}
                >
                  <a
                    href={l.href}
                    onClick={(e) => follow(e, l.href)}
                    className="group flex items-baseline justify-between gap-6 py-6 transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:py-8"
                  >
                    <span className="font-editorial text-[clamp(1.9rem,8.2vw,3rem)] italic leading-none tracking-[-0.01em] sm:text-6xl">
                      {l.label}
                    </span>
                    <span
                      aria-hidden
                      className="text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:opacity-100 motion-reduce:transition-none"
                    >
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Every link above scrolls this page; this one leaves it. Set at
                label scale rather than heading scale so the difference is
                visible before it is clicked, and it closes the dialog first so
                the modal state does not outlive the route it belongs to. */}
            <Link
              href="/giris"
              onClick={() => dialog.current?.close()}
              className="menu-rise mt-8 flex items-center justify-between gap-6 text-primary transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              style={{ animationDelay: `${60 + nav.links.length * 55}ms` }}
            >
              <span className="eyebrow">{nav.memberArea}</span>
              <span aria-hidden>&rarr;</span>
            </Link>
          </nav>

          <div
            className="menu-rise wrapper relative z-10 flex shrink-0 flex-col gap-2 border-t border-foreground/15 py-6"
            style={{ animationDelay: `${115 + nav.links.length * 55}ms` }}
          >
            <a
              href={`mailto:${email}`}
              className="text-base font-light text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {email}
            </a>
            <p lang="tr" className="eyebrow text-foreground/45">
              {place}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
};
