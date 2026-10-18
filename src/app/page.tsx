import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Capability from "@/components/sections/Capability";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Ecosystem from "@/components/sections/Ecosystem";
import Work from "@/components/sections/Work";
import Loop, { REEL } from "@/components/sections/Loop";
import Contact from "@/components/sections/Contact";
import { SERVICES, SITE } from "@/content/site";

/* Person, not Organization: this is a personal portfolio. Every claim here
   is already stated in the visible copy. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.owner,
  jobTitle: "Software & Hardware Developer",
  description:
    "Software and hardware developer building the 411 ecosystem — web applications, UI/UX design, and embedded IoT systems, with localized AI systems in development.",
  url: `${SITE.url}/`,
  image: `${SITE.url}/og-card.png`,
  email: `mailto:${SITE.email}`,
  address: { "@type": "PostalAddress", addressCountry: "NG" },
  sameAs: [SITE.github],
  knowsAbout: [
    "UI/UX Design",
    "Web Application Development",
    "Embedded C/C++",
    "IoT Sensors and Gateways",
    "Microcontrollers",
    "AutoCAD 3D Prototyping",
    "AI Integration",
    "Robotics",
  ],
  makesOffer: SERVICES.items.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.name },
  })),
};

/*
 * Section order matches the live site. Process (wireframe → clay → final)
 * stays unmounted until real renders exist; the reel mounts once REEL.ready.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <Capability />
        {REEL.ready && <Loop />}
        <Services />
        <About />
        <Ecosystem />
        <Work />
        <Contact />
      </main>
    </>
  );
}
