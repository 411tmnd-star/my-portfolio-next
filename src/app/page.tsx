import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Loop from "@/components/sections/Loop";
import Ecosystem from "@/components/sections/Ecosystem";
import Proof from "@/components/sections/Proof";
import Process from "@/components/sections/Process";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Loop />
        <Ecosystem />
        <Proof />
        <Process />
        <About />
        <Contact />
      </main>
    </>
  );
}
