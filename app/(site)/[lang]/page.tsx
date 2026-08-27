import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { SlidingText } from "@/components/Hero/SlidingText";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { FourWayTest } from "@/components/FourWayTest";
import { Numbers } from "@/components/Numbers";
import { PresidentsMessage } from "@/components/PresidentsMessage";
import { PastPresidents } from "@/components/PastPresidents";
import { Board } from "@/components/Board";
import { Committees } from "@/components/Committees";
import { AreasOfFocus } from "@/components/AreasOfFocus";
import { Join } from "@/components/Join";
import { Footer } from "@/components/Footer";
import { ScrollAnimations } from "@/components/ScrollAnimations";
import { getDictionary } from "@/i18n/dictionaries";
import { getBoard, getPresidents } from "@/lib/cms/queries";

export default async function Home() {
  // Server sections read the dictionary themselves via the `[lang]` root
  // param; the animated client sections are handed just the slice they render.
  const dict = await getDictionary();

  // The board wheel is a Client Component, so its content is fetched here and
  // handed down. The term on its centre mark is the sitting president's — the
  // board serves the same Rotary year — read off the head of the roll rather
  // than written down a second time.
  const [seats, roll] = await Promise.all([getBoard(), getPresidents()]);

  return (
    <main className="flex flex-col relative">
      <Navbar nav={dict.nav} email={dict.join.email} place={dict.about.meta} />
      <Hero />
      <SlidingText src={dict.hero.logo} alt={dict.hero.logoAlt} />
      <Marquee />
      <About />
      <Numbers />
      <FourWayTest fourWayTest={dict.fourWayTest} />
      <PresidentsMessage
        president={dict.president}
        name={roll[0]?.name ?? ""}
      />
      <PastPresidents />
      <Board board={dict.board} seats={seats} term={roll[0]?.term ?? ""} />
      <Committees />
      <AreasOfFocus />
      <Join />
      <Footer />
      <ScrollAnimations />
    </main>
  );
}
