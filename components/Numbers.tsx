import { getDictionary } from "@/i18n/dictionaries";
import { Grain } from "./Editorial";

export const Numbers = async () => {
  const { numbers } = await getDictionary();

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <Grain variant="ink" />

      <div className="wrapper relative z-10 py-20 sm:py-28">
        <p className="eyebrow rise text-primary">{numbers.eyebrow}</p>
        <div className="mt-10 grid gap-10 border-t border-paper/15 pt-10 sm:grid-cols-3">
          {numbers.stats.map(({ big, label }) => (
            <div key={label} className="rise">
              <p
                data-chars
                className="font-editorial text-6xl italic leading-none text-primary sm:text-7xl lg:text-8xl"
              >
                {big}
              </p>
              <p className="mt-4 text-sm font-light text-paper/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
