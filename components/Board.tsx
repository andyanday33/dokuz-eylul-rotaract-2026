const BOARD = [
  { name: "Ad Soyad", initials: "AS", role: "Başkan" },
  { name: "Ad Soyad", initials: "AS", role: "Başkan Yardımcısı" },
  { name: "Ad Soyad", initials: "AS", role: "Sekreter" },
  { name: "Ad Soyad", initials: "AS", role: "Sayman" },
  { name: "Ad Soyad", initials: "AS", role: "Çavuş" },
];

export const Board = () => {
  return (
    <section id="board" className="border-y border-border bg-card">
      <div className="wrapper py-28 sm:py-36">
        <p className="eyebrow rise text-primary">04 — Yönetim kurulu</p>
        <h2
          data-split
          className="wordmark mt-6 text-[8vw] leading-[0.9] sm:text-[4.5rem]"
        >
          Beş kişi, tek bir görev
        </h2>
        <div className="rule rule-cranberry mt-12 h-[2px] w-full" />
        <div
          data-stagger
          className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5"
        >
          {BOARD.map((m) => (
            <article key={m.name} className="group bg-background p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {m.initials}
              </div>
              <h3 className="mt-6 text-xl font-bold leading-tight transition-colors group-hover:text-primary">
                {m.name}
              </h3>
              <p className="eyebrow mt-2 text-muted-foreground">{m.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
