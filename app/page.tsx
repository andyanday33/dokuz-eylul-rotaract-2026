import { Hero } from "@/components/Hero/Hero";
import { SlidingText } from "@/components/Hero/SlidingText";

export default function Home() {
  return (
    <main className="flex flex-col relative h-[200vh]">
      <Hero />
      <SlidingText />
    </main>
  );
}
