const FOUR_WAY_TEST = [
  {
    n: "01",
    q: "Doğru mu?",
    a: "Her eylemimizde dürüstlüğü ve şeffaflığı ön planda tutuyoruz.",
  },
  {
    n: "02",
    q: "İlgili herkese adil mi?",
    a: "Kararlarımızda eşitliği ve adaleti gözetiyor, kimseyi dışlamıyoruz.",
  },
  {
    n: "03",
    q: "İyi niyet ve dostluk yaratacak mı?",
    a: "Projelerimizle toplumda güven ve kalıcı dostluklar inşa ediyoruz.",
  },
  {
    n: "04",
    q: "İlgili herkes için yararlı olacak mı?",
    a: "Hizmetlerimizin herkese somut fayda sağlamasını hedefliyoruz.",
  },
];

export const FourWayTest = () => {
  return (
    <section id="four-way-test" className="border-y border-border bg-card">
      <div className="wrapper py-28 sm:py-36">
        <p className="eyebrow rise text-primary">02 — Dörtlü Öz Denetim</p>
        <h2
          data-split
          className="wordmark mt-6 max-w-4xl text-[8vw] leading-[0.9] sm:text-[4.5rem]"
        >
          Düşündüğümüz, söylediğimiz ve yaptığımız her şeyde
        </h2>
        <div className="rule rule-cranberry mt-12 h-[2px] w-full" />
        <div
          data-stagger
          className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2"
        >
          {FOUR_WAY_TEST.map((item) => (
            <article key={item.n} className="group bg-background p-8 sm:p-10">
              <span className="eyebrow text-muted-foreground">{item.n}</span>
              <h3
                data-chars
                className="wordmark mt-5 text-3xl leading-[0.95] text-primary sm:text-4xl"
              >
                {item.q}
              </h3>
              <p className="mt-4 text-muted-foreground">{item.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
