import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Grain } from "@/components/Editorial";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PresidentTimeline } from "@/components/PresidentTimeline";
import { Wordmark } from "@/components/Wordmark";
import { foundingTerm, foundingYear, rollSpan } from "@/lib/presidents";
import { getPresidents } from "@/lib/cms/queries";
import { fill, getDictionary, getLocale } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { presidents, meta } = await getDictionary();
  // Memoised per request, so asking here and again in the page body below is
  // one query rather than two.
  const roll = await getPresidents();
  return {
    title: `${presidents.pageTitle} — ${meta.title}`,
    description: fill(presidents.pageIntro, { year: foundingYear(roll) }),
  };
}

/**
 * The whole roll, on its own page.
 *
 * It opens on the scale rather than on a headline: the roll is what the page
 * is for, so anything in front of it would only be delay. The masthead carries
 * its own way back and its own language switch, because the home page's fixed
 * navbar is built out of same-page anchors that mean nothing here.
 */
export default async function PresidentsPage() {
  const dict = await getDictionary();
  const lang = await getLocale();
  const roll = await getPresidents();
  const { presidents } = dict;

  return (
    <main className="flex min-h-full flex-1 flex-col bg-paper text-foreground">
      <header className="border-b border-foreground/15">
        <div className="wrapper flex h-16 items-center justify-between gap-4">
          <Wordmark
            href={`/${lang}`}
            src={dict.hero.logo}
            alt={dict.hero.logoAlt}
            priority
            className="w-(--masthead-logo-parked) shrink-0"
          />

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href={`/${lang}`}
              className="eyebrow group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span
                aria-hidden
                className="transition-transform group-hover:-translate-x-1 motion-reduce:transition-none"
              >
                ←
              </span>
              {presidents.back}
            </Link>
            <span aria-hidden className="h-4 w-px bg-foreground/20" />
            <LanguageSwitcher label={dict.nav.languageLabel} />
          </div>
        </div>
      </header>

      <section className="relative flex-1 overflow-hidden">
        <Grain />

        <div className="wrapper relative z-10 py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-4">
            <p className="eyebrow text-primary">{presidents.label}</p>
            <p className="eyebrow tabular-nums text-foreground/45">
              {rollSpan(roll)}
            </p>
          </div>

          <h1 className="font-editorial mt-8 text-[16vw] italic leading-[0.95] tracking-[-0.02em] sm:text-7xl lg:text-8xl">
            {presidents.pageTitle}
          </h1>

          <p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-foreground/65">
            {fill(presidents.pageIntro, { year: foundingYear(roll) })}
          </p>

          {/* oldest first: the scale reads forward, the way time does, and
              ends on whoever is in office now */}
          <PresidentTimeline
            entries={[...roll].reverse()}
            currentTerm={roll[0]?.term ?? ""}
            currentLabel={presidents.current}
            foundingTerm={foundingTerm(roll)}
            foundingLabel={presidents.founded}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
