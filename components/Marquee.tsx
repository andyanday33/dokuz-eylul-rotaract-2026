const ITEMS = [
  "Kişisel çıkarların ötesinde hizmet",
  "Eylem insanları",
  "Dostluk",
  "Liderlik",
  "Toplum",
];

export const Marquee = () => {
  return (
    <div className="overflow-hidden border-y border-border bg-primary py-3">
      <div className="marquee-track flex w-max gap-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-10">
            {ITEMS.map((t) => (
              <span key={t} className="eyebrow text-primary-foreground">
                {t} ·
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
