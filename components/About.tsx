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
    <section id="hakkimizda" className="wrapper py-28 sm:py-36">
      <p className="eyebrow rise text-primary">01 — Biz kimiz</p>
      <h2
        data-split
        className="wordmark mt-6 max-w-4xl text-[8vw] leading-[0.9] sm:text-[4.5rem]"
      >
        İşi konuşmaktansa yapmayı seçenler için bir kulüp
      </h2>
      <div className="rule rule-cranberry mt-12 h-[2px] w-full" />
      <div className="mt-12 grid gap-12 md:grid-cols-3">
        {PILLARS.map((p) => (
          <article key={p.n} className="rise">
            <span className="eyebrow text-muted-foreground">{p.n}</span>
            <h3 className="mt-3 text-2xl font-bold">{p.title}</h3>
            <p className="mt-3 text-muted-foreground">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
