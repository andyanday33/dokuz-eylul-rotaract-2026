import { getDictionary } from "@/i18n/dictionaries";
import { Grain, Nameplate } from "./Editorial";

export const About = async () => {
  const { about } = await getDictionary();

  return (
    <section
      id="hakkimizda"
      className="relative overflow-hidden bg-paper text-foreground"
    >
      <Grain />
      {/* Ghost watermark */}
      <span
        aria-hidden
        className="font-editorial pointer-events-none absolute -right-[3vw] top-[10vw] select-none text-[40vw] italic leading-none text-foreground/[0.03]"
      >
        {about.watermark}
      </span>

      <div className="wrapper relative z-10 py-24 sm:py-36">
        <Nameplate
          index={about.index}
          label={about.label}
          meta={about.meta}
          metaLang="tr"
        />

        <h2
          data-chars
          className="font-editorial mt-8 max-w-4xl text-[11vw] italic leading-[1.1] tracking-[-0.015em] sm:text-6xl lg:text-7xl"
        >
          {about.heading}
        </h2>

        <div className="mt-16 grid gap-x-12 gap-y-12 border-t border-foreground/15 pt-12 md:grid-cols-3">
          {about.pillars.map((p) => (
            <article key={p.n} className="rise">
              <span className="font-editorial text-5xl italic text-primary">
                {p.n}
              </span>
              <h3 className="font-editorial mt-4 text-2xl italic">{p.title}</h3>
              <p className="mt-3 font-light leading-relaxed text-foreground/70">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
