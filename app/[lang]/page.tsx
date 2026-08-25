import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { SlidingText } from "@/components/Hero/SlidingText";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { FourWayTest } from "@/components/FourWayTest";
import { Numbers } from "@/components/Numbers";
import { PresidentsMessage } from "@/components/PresidentsMessage";
import { Board } from "@/components/Board";
import { Committees } from "@/components/Committees";
import { AreasOfFocus } from "@/components/AreasOfFocus";
import { Join } from "@/components/Join";
import { Footer } from "@/components/Footer";
import { ScrollAnimations } from "@/components/ScrollAnimations";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Home() {
  // Server sections read the dictionary themselves via the `[lang]` root
  // param; the animated client sections are handed just the slice they render.
  const dict = await getDictionary();

  return (
    <main className="flex flex-col relative">
      <Navbar nav={dict.nav} email={dict.join.email} place={dict.about.meta} />
      <Hero />
      <SlidingText src={dict.hero.logo} alt={dict.hero.logoAlt} />
      <Marquee />
      <About />
      <Numbers />
      <FourWayTest fourWayTest={dict.fourWayTest} />
      <PresidentsMessage president={dict.president} />
      <Board board={dict.board} />
      <Committees />
      <AreasOfFocus />
      <Join />
      <Footer />
      <ScrollAnimations />
    </main>
  );
}
