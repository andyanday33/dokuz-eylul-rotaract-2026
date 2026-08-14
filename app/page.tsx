import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { SlidingText } from "@/components/Hero/SlidingText";
import { Marquee } from "@/components/Marquee";

export default function Home() {
  return (
    <main className="flex flex-col relative h-[200vh]">
      <Navbar />
      <Hero />
      <SlidingText />
      <Marquee />
    </main>
  );
}
