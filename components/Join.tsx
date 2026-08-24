export const Join = () => {
  return (
    <section id="join" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[1240px] px-6 py-28 sm:px-10 sm:py-36">
        <p className="eyebrow rise">07 — Bize katıl</p>
        <h2
          data-split
          className="wordmark mt-6 max-w-3xl text-[10vw] leading-[0.88] sm:text-[5.5rem]"
        >
          Bir saat getir. Bir çevreyle ayrıl.
        </h2>
        <p className="rise mt-8 max-w-lg text-lg font-light opacity-90">
          Üyelik, bölgemizdeki 18–30 yaş arası herkese açıktır. Önce bir
          toplantıya gelin — form yok, ücret yok, sadece gelin.
        </p>
        <a
          href="mailto:merhaba@rotaractkulubu.org"
          className="eyebrow rise mt-10 inline-flex items-center gap-3 bg-background px-7 py-4 text-primary transition-transform hover:-translate-y-0.5"
        >
          merhaba@rotaractkulubu.org <span aria-hidden>→</span>
        </a>
      </div>
    </section>
  );
};
