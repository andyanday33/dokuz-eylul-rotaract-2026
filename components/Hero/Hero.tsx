import { Grain, Vignette } from "../Editorial";

export const Hero = () => {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col overflow-hidden bg-paper text-foreground"
    >
      <Grain />
      <Vignette />

      {/* Dateline */}
      <div className="hero-fade wrapper">
        <div className="flex items-center justify-between border-b border-foreground/20 pb-3 pt-24 sm:pt-28">
          <p className="eyebrow text-foreground/60">
            Rotaract · 2440. Bölge · Grup 4
          </p>
          <p className="eyebrow hidden text-foreground/55 sm:block">
            Dokuz Eylül · İzmir · MMXXVI
          </p>
        </div>
      </div>

      {/* Reserved space where the floating logo hovers */}
      <div className="hero-fade wrapper" aria-hidden>
        <div className="h-40 xs:h-44 sm:h-56 md:h-64 lg:h-72 xl:h-80" />
      </div>

      {/* Masthead tagline + call to action */}
      <div className="hero-fade wrapper mt-auto pb-14">
        <div className="grid gap-10 border-t border-foreground/20 pt-8 md:grid-cols-[1.25fr_1fr] md:items-end">
          <div>
            <h1 className="sr-only">
              Rotaract Kulübü — hizmetle gelen dostluk
            </h1>
            <p className="font-editorial max-w-2xl text-[8vw] italic leading-[1.08] sm:text-4xl lg:text-5xl">
              Dostluğu, mahallenin ölçebileceği bir hizmete{" "}
              <span className="text-primary">dönüştürüyoruz.</span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-5 md:items-end md:text-right">
            <p className="max-w-xs text-sm font-light leading-relaxed text-foreground/60">
              Her ayın birinci ve üçüncü perşembesi 19.00’da Eski Kütüphane’de
              buluşuyoruz. Konuklar her zaman davetlidir.
            </p>
            <a
              href="#join"
              className="eyebrow group inline-flex items-center gap-3 bg-foreground px-7 py-4 text-paper transition-colors hover:bg-primary"
            >
              Kulübe katıl{" "}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
