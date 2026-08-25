import { getDictionary } from "@/i18n/dictionaries";
import { Grain } from "./Editorial";

export const Join = async () => {
  const { join } = await getDictionary();

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
        {join.watermark}
      </span>

      <div className="wrapper relative z-10 py-28 sm:py-36">
        <p className="eyebrow rise">{join.eyebrow}</p>
        <h2
          data-chars
          className="font-editorial mt-6 max-w-3xl text-[13vw] italic leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          {join.heading}
        </h2>
        <p className="rise mt-8 max-w-lg text-lg font-light opacity-90">
          {join.body}
        </p>
        <a
          href={`mailto:${join.email}`}
          className="eyebrow group mt-10 inline-flex items-center gap-3 bg-background px-7 py-4 text-primary transition-transform hover:-translate-y-0.5"
        >
          {join.email}{" "}
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
