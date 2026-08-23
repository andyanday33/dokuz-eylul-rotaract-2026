import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { SlidingText } from "@/components/Hero/SlidingText";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { FourWayTest } from "@/components/FourWayTest";
import { Numbers } from "@/components/Numbers";
import { Board } from "@/components/Board";
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
      <Board />
      <ScrollAnimations />
    </main>
  );
}
