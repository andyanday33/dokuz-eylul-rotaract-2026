"use client";

import { useRef, useState } from "react";
import { AnnouncementForm, EventForm, InviteForm } from "./BoardForms";

/**
 * The three board tasks, one at a time.
 *
 * They were stacked down the page, which made the third one — the longest —
 * something you scrolled past the other two to reach, and implied a sequence
 * that is not there. They are parallel and unrelated, which is what a tablist
 * says.
 *
 * The strip restates the device the page heading already uses: small caps on a
 * rule, with the open one cutting a cranberry segment into it. Deliberately
 * not numbered — the 01–07 system belongs to the public site's sections, and
 * numbering three things that have no order would be inventing information.
 *
 * Every panel stays mounted and inactive ones are `hidden`, which takes them
 * out of the tab order and the accessibility tree while keeping their state.
 * Switching tabs to check a date and coming back must not empty the box
 * someone was halfway through typing into.
 */
const TABS = [
  { id: "davet", label: "Davet", Form: InviteForm },
  { id: "duyuru", label: "Duyuru", Form: AnnouncementForm },
  { id: "etkinlik", label: "Etkinlik", Form: EventForm },
] as const;

export function BoardTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs and open as they go, which is the right
  // behaviour when switching costs nothing — the panels are already rendered.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const targets: Record<string, number> = {
      ArrowLeft: active - 1,
      ArrowRight: active + 1,
      Home: 0,
      End: TABS.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;

    event.preventDefault();
    const next = (target + TABS.length) % TABS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Yönetim işlemleri"
        onKeyDown={onKeyDown}
        className="flex gap-6 border-b border-foreground/15 sm:gap-8"
      >
        {TABS.map((tab, i) => {
          const open = i === active;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              aria-controls={`${tab.id}-panel`}
              aria-selected={open}
              tabIndex={open ? 0 : -1}
              onClick={() => setActive(i)}
              // -mb-px pulls the 2px active rule over the strip's own hairline
              // so the accent replaces the line rather than sitting under it.
              className={`eyebrow -mb-px border-b-2 pb-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                open
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/45 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {TABS.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${tab.id}-panel`}
          aria-labelledby={`${tab.id}-tab`}
          hidden={i !== active}
          className="pt-10"
        >
          <tab.Form />
        </div>
      ))}
    </>
  );
}
