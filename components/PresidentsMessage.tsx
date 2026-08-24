export const PresidentsMessage = () => {
  return (
    <section id="president" className="wrapper py-28 sm:py-36">
      <p className="eyebrow rise text-primary">03 — Başkanın mesajı</p>
      <h2
        data-split
        className="wordmark mt-6 max-w-3xl text-[8vw] leading-[0.9] sm:text-[4.5rem]"
      >
        Var olmakla geçen bir yıl
      </h2>
      <div className="rule rule-cranberry mt-12 h-0.5 w-full" />
      <div className="mt-14 grid gap-12 md:grid-cols-[380px_1fr] md:items-start">
        <figure className="rise overflow-hidden border border-border bg-card">
          <img
            src="/president/portrait.jpg"
            alt="Kulüp başkanının portresi"
            loading="lazy"
            width={800}
            height={1008}
            className="aspect-4/5 w-full object-cover"
          />
          <figcaption className="border-t border-border px-6 py-5">
            <p className="text-lg font-bold">Mehmet Emre UÇAR</p>
            <p className="eyebrow mt-1 text-primary">Kulüp Başkanı 2026–27</p>
          </figcaption>
        </figure>
        <div
          data-stagger
          className="space-y-6 text-lg font-light text-muted-foreground"
        >
          <p>
            Bu kulübe katıldığımda tek bir proje için gelmiştim; insanlar için
            kaldım. Neredeyse her üyeden duyduğum hikâye bu — yardım etmek için
            geliyorsun, kendi hedeflerine karşı seni sorumlu tutan bir çevreyle
            ayrılıyorsun.
          </p>
          <p>
            Bu yıl niceliğe değil derinliğe odaklanıyoruz: mahallelerimizi en
            iyi tanıyan kuruluşlarla daha az sayıda ama daha uzun süreli iş
            birlikleri ve üyelerin bir işi baştan sona yürütebileceği daha fazla
            alan.
          </p>
          <p>
            18–30 yaş aralığındaysanız ve harcadığınız saatlerin gerçekten
            karşılık bulduğu bir yer arıyorsanız, bir toplantımıza gelin. Bir
            soru getirin, bir arkadaş getirin ya da hiçbir şey getirmeyin.
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            Hizmetle gelen dostluk — her hafta, istisnasız.
          </p>
        </div>
      </div>
    </section>
  );
};
