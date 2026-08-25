import { Grain } from "./Editorial";

export const Join = () => {
  return (
    <section
      id="join"
      className="relative overflow-hidden bg-primary text-primary-foreground"
    >
      <Grain variant="ink" />
      {/* Ghost watermark */}
      <span
        aria-hidden
        className="font-editorial pointer-events-none absolute -bottom-[8vw] left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[34vw] italic leading-none text-primary-foreground/[0.06]"
      >
        Katıl
      </span>

      <div className="wrapper relative z-10 py-28 sm:py-36">
        <p className="eyebrow rise">07 — Bize katıl</p>
        <h2
          data-chars
          className="font-editorial mt-6 max-w-3xl text-[13vw] italic leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          Bir saat getir. Bir çevreyle ayrıl.
        </h2>
        <p className="rise mt-8 max-w-lg text-lg font-light opacity-90">
          Üyelik, bölgemizdeki 18–30 yaş arası herkese açıktır. Önce bir
          toplantıya gelin — form yok, ücret yok, sadece gelin.
        </p>
        <a
          href="mailto:merhaba@rotaractkulubu.org"
          className="eyebrow group mt-10 inline-flex items-center gap-3 bg-background px-7 py-4 text-primary transition-transform hover:-translate-y-0.5"
        >
          merhaba@rotaractkulubu.org{" "}
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </a>
      </div>
    </section>
  );
};
