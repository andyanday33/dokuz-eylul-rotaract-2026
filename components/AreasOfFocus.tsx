const AREAS_OF_FOCUS = [
  {
    n: "01",
    title: "Barışı Destekleme",
    body: "Çatışmaların önlenmesi ve barış süreçlerinin güçlendirilmesi için projeler geliştiriyoruz.",
  },
  {
    n: "02",
    title: "Hastalıkla Mücadele",
    body: "Bulaşıcı hastalıkların önlenmesi ve sağlık hizmetlerine erişimin artırılması için çalışıyoruz.",
  },
  {
    n: "03",
    title: "Temiz Su ve Hijyen",
    body: "Temiz su, sanitasyon ve hijyen olanaklarına erişimi iyileştiren projeler yürütüyoruz.",
  },
  {
    n: "04",
    title: "Anne ve Çocuk Sağlığı",
    body: "Anne ve çocuk ölümlerinin azaltılması, sağlıklı yaşam koşullarının desteklenmesi için uğraşıyoruz.",
  },
  {
    n: "05",
    title: "Eğitimi Destekleme",
    body: "Kaliteli eğitime erişimi artırarak toplulukları güçlendiriyor ve fırsat eşitliği sağlıyoruz.",
  },
  {
    n: "06",
    title: "Yerel Ekonomileri Büyütme",
    body: "Girişimcilik ve istihdam fırsatlarını destekleyerek yerel ekonomilerin kalkınmasına katkıda bulunuyoruz.",
  },
  {
    n: "07",
    title: "Çevreyi Koruma",
    body: "Doğal kaynakların sürdürülebilir kullanımını ve çevre bilincinin yaygınlaştırılmasını destekliyoruz.",
  },
];

export const AreasOfFocus = () => {
  return (
    <section id="focus" className="wrapper py-20 sm:py-28">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow rise text-primary">06 — Odak alanları</p>
          <h2
            data-split
            className="wordmark mt-3 max-w-2xl text-3xl leading-[0.95] sm:text-5xl"
          >
            Yedi amaç. Tek bir pusula.
          </h2>
        </div>
        <p className="rise max-w-md text-sm text-muted-foreground">
          Her proje, Rotary&apos;nin yedi odak alanından birine bağlanır.
          Üstüne gel, hangi amaca hizmet ettiğini gör.
        </p>
      </div>

      <div className="rule rule-cranberry mt-10 h-[2px] w-full" />

      <ul data-stagger className="mt-10">
        {AREAS_OF_FOCUS.map((a) => (
          <li
            key={a.n}
            className="focus-row group relative isolate overflow-hidden border-t border-foreground/12 last:border-b"
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
                <h3 className="wordmark text-2xl leading-[0.95] transition-transform duration-500 group-hover:md:translate-x-2 sm:text-4xl md:text-[2.6rem]">
                  {a.title}
                </h3>

                {/* Description — always visible on mobile, revealed on hover (desktop) */}
                <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out group-hover:md:grid-rows-[1fr] md:grid-rows-[0fr]">
                  <div className="overflow-hidden">
                    <p className="mt-3 max-w-xl text-sm text-muted-foreground transition-colors duration-500 group-hover:md:text-primary-foreground/85 md:mt-4">
                      {a.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="eyebrow rise mt-8 text-muted-foreground">
        Rotary International — Yedi Odak Alanı
      </p>
    </section>
  );
};
