const STATS = [
  { big: "1000+", label: "Geçen yıl gönüllü saati" },
  { big: "30+", label: "Aktif üye" },
  { big: "10+", label: "Paydaş kuruluş" },
];

export const Numbers = () => {
  return (
    <section className="border-y border-border bg-card">
      <div className="wrapper grid gap-10 py-20 sm:grid-cols-3">
        {STATS.map(({ big, label }) => (
          <div key={label} className="rise">
            <p data-chars className="wordmark text-6xl text-primary sm:text-7xl">
              {big}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
