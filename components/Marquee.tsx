import { getDictionary } from "@/i18n/dictionaries";

export const Marquee = async () => {
  const { marquee } = await getDictionary();

  return (
    <div className="overflow-hidden border-y-2 border-foreground bg-primary py-3 text-primary-foreground">
      <div className="marquee-track flex w-max">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {marquee.items.map((t) => (
              <span key={t} className="eyebrow flex items-center gap-6 pr-6">
                {t}
                <span aria-hidden>✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
