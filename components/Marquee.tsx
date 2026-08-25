const ITEMS = [
  "Kişisel çıkarların ötesinde hizmet",
  "Eylem insanları",
  "Dostluk",
  "Liderlik",
  "Toplum",
];

export const Marquee = () => {
  return (
    <div className="overflow-hidden border-y-2 border-foreground bg-primary py-3 text-primary-foreground">
      <div className="marquee-track flex w-max">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {ITEMS.map((t) => (
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
