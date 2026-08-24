const CHAIRS = [
  { name: "Ad Soyad", role: "Kulüp Hizmetleri", photo: "/chairs/kulup-hizmetleri.jpg" },
  { name: "Ad Soyad", role: "Toplum Hizmetleri", photo: "/chairs/toplum-hizmetleri.jpg" },
  { name: "Ad Soyad", role: "Meslek Hizmetleri", photo: "/chairs/meslek-hizmetleri.jpg" },
  { name: "Ad Soyad", role: "Uluslararası Hizmetler", photo: "/chairs/uluslararasi-hizmetler.jpg" },
  { name: "Ad Soyad", role: "Kurumsal Tanıtım ve Sosyal Medya", photo: "/chairs/kurumsal-tanitim.jpg" },
  { name: "Ad Soyad", role: "Vakıf", photo: "/chairs/vakif.jpg" },
  { name: "Ad Soyad", role: "Teknoloji ve İnovasyon", photo: "/chairs/teknoloji-inovasyon.jpg" },
];

export const Committees = () => {
  return (
    <section id="committees" className="wrapper py-20 sm:py-24">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow rise text-primary">05 — Komite başkanları</p>
          <h2
            data-split
            className="wordmark mt-3 max-w-2xl text-3xl leading-[0.95] sm:text-4xl"
          >
            İşin sahiplendiği yer
          </h2>
        </div>
        <p className="rise max-w-md text-sm text-muted-foreground">
          Her komite, kulübün günlük işleyişini ve projelerini yürüten bir
          sorumluluk alanıdır.
        </p>
      </div>
      <div className="rule rule-cranberry mt-8 h-[2px] w-full" />

      {/* Desktop: slat accordion */}
      <ul
        data-stagger
        className="mt-10 hidden gap-1 sm:flex sm:h-[420px] lg:h-[480px]"
      >
        {CHAIRS.map((c, i) => (
          <li
            key={c.role}
            className="group relative flex-[1_1_0%] overflow-hidden rounded-sm bg-card transition-[flex-grow] duration-700 ease-out hover:flex-[3.4_1_0%]"
          >
            <img
              src={c.photo}
              alt={`${c.name} portresi`}
              loading="lazy"
              className="chair-photo absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:[filter:sepia(0)_saturate(1.05)]"
            />
            <div className="absolute inset-0 bg-foreground/45 transition-opacity duration-700 group-hover:opacity-0" />
            <span className="absolute left-3 top-3 eyebrow text-primary-foreground/80">
              {String(i + 1).padStart(2, "0")}
            </span>
            {/* Rotated label at rest */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rotate-180 transition-opacity duration-300 [writing-mode:vertical-rl] group-hover:opacity-0">
              <span className="wordmark whitespace-nowrap text-base tracking-[0.06em] text-primary-foreground">
                {c.role}
              </span>
            </div>
            {/* Horizontal card on hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <div className="inline-block max-w-full rounded-md bg-card/90 px-4 py-3 backdrop-blur-sm">
                <p className="eyebrow text-primary">{c.role}</p>
                <h3 className="mt-1 whitespace-nowrap text-lg font-bold leading-tight">
                  {c.name}
                </h3>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Mobile: staggered offset strip list */}
      <ul data-stagger className="mt-8 flex flex-col gap-2 sm:hidden">
        {CHAIRS.map((c, i) => (
          <li
            key={c.role}
            className="group relative h-24 overflow-hidden rounded-sm"
            style={{ marginLeft: `${(i % 3) * 12}px` }}
          >
            <img
              src={c.photo}
              alt={`${c.name} portresi`}
              loading="lazy"
              className="chair-photo absolute inset-0 h-full w-full object-cover object-[50%_28%] grayscale"
            />
            <div className="absolute inset-0 bg-foreground/40" />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <div>
                <p className="eyebrow text-primary-foreground/75">{c.role}</p>
                <h3 className="mt-0.5 text-base font-bold text-primary-foreground">
                  {c.name}
                </h3>
              </div>
              <span className="eyebrow text-primary-foreground/60">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
