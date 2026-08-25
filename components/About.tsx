import { Grain, Nameplate } from "./Editorial";

const PILLARS = [
  {
    n: "01",
    title: "Profesyonel Gelişim",
    body: "Liderlik becerileri, iş dünyası bilgisi ve kişisel gelişim fırsatları sunarak genç profesyonellerin kariyerlerine yön vermelerine yardımcı oluyoruz.",
  },
  {
    n: "02",
    title: "Toplum Hizmeti",
    body: "Yerel ve uluslararası projelerde gönüllü çalışarak topluma somut katkılar sağlıyor, değişimi birlikte inşa ediyoruz.",
  },
  {
    n: "03",
    title: "Uluslararası Anlayış",
    body: "Farklı kültürlerden insanlarla bağ kurarak dünya barışına ve anlayışına katkıda bulunuyor, sınırları aşan dostluklar kuruyoruz.",
  },
];

export const About = () => {
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
        Biz
      </span>

      <div className="wrapper relative z-10 py-24 sm:py-36">
        <Nameplate index="01" label="Biz kimiz" meta="Dokuz Eylül · İzmir" />

        <h2
          data-chars
          className="font-editorial mt-8 max-w-4xl text-[11vw] italic leading-[1.1] tracking-[-0.015em] sm:text-6xl lg:text-7xl"
        >
          İşi konuşmaktansa yapmayı seçenler için bir kulüp
        </h2>

        <div className="mt-16 grid gap-x-12 gap-y-12 border-t border-foreground/15 pt-12 md:grid-cols-3">
          {PILLARS.map((p) => (
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
