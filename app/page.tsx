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
import { ScrollAnimations } from "@/components/ScrollAnimations";

export default function Home() {
  return (
    <main className="flex flex-col relative">
      <Navbar />
      <Hero />
      <SlidingText />
      <Marquee />
      <About />
      <Numbers />
      <FourWayTest />
      <PresidentsMessage />
      <Board />
      <Committees />
      <AreasOfFocus />
      <Join />
      <ScrollAnimations />
    </main>
  );
}
