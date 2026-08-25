import { getDictionary } from "@/i18n/dictionaries";
import { Grain, Nameplate } from "./Editorial";

export const AreasOfFocus = async () => {
  const { areasOfFocus } = await getDictionary();

  return (
    <section
      id="focus"
      className="relative overflow-hidden bg-paper text-foreground"
    >
      <Grain />

      <div className="wrapper relative z-10 py-24 sm:py-32">
        <Nameplate
          index={areasOfFocus.index}
          label={areasOfFocus.label}
          meta={areasOfFocus.meta}
        />

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2
            data-chars
            className="font-editorial max-w-2xl text-[11vw] italic leading-[1.05] tracking-[-0.015em] sm:text-5xl lg:text-6xl"
          >
            {areasOfFocus.heading}
          </h2>
          <p className="rise max-w-md text-sm font-light leading-relaxed text-foreground/60">
            {areasOfFocus.intro}
          </p>
        </div>

        <ul data-stagger className="mt-14">
          {areasOfFocus.items.map((a) => (
            <li
              key={a.n}
              className="focus-row group relative isolate overflow-hidden border-t border-foreground/15 last:border-b"
            >
              {/* Cranberry sweep — fills the row from the left on hover (desktop) */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 hidden origin-left scale-x-0 bg-primary transition-transform duration-[650ms] ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-x-100 md:block"
              />
              {/* Mobile accent bar */}
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-[3px] bg-primary md:hidden"
              />

              <div className="flex items-baseline gap-4 py-6 pl-4 pr-1 transition-colors duration-500 group-hover:md:text-primary-foreground sm:gap-8 sm:py-8 md:pl-0">
                <span className="focus-index shrink-0 text-4xl sm:text-6xl">
                  {a.n}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="font-editorial text-2xl italic leading-[1.05] transition-transform duration-500 group-hover:md:translate-x-2 sm:text-4xl md:text-[2.6rem]">
                    {a.title}
                  </h3>

                  {/* Description — always visible on mobile, revealed on hover (desktop) */}
                  <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out group-hover:md:grid-rows-[1fr] md:grid-rows-[0fr]">
                    <div className="overflow-hidden">
                      <p className="mt-3 max-w-xl text-sm font-light text-foreground/60 transition-colors duration-500 group-hover:md:text-primary-foreground/85 md:mt-4">
                        {a.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
