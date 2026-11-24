import { DockedMarkBadge } from "@/components/hero/DockedMarkBadge";
import { DockProgressProvider } from "@/components/hero/DockProgress";
import Hero from "@/components/hero/Hero";
import Contact from "@/components/sections/Contact";
import HowIWork from "@/components/sections/HowIWork";
import Loop from "@/components/sections/Loop";
import Nav from "@/components/sections/Nav";
import Process from "@/components/sections/Process";
import Projects from "@/components/sections/Projects";
import { READY_PROJECTS } from "@/content/projects";
import { SITE } from "@/content/site";

/* Person, not Organization: a personal portfolio. Every claim here is in the visible copy. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.owner,
  jobTitle: SITE.role,
  description: "Builds character rigs, cloth checks, asset pipelines and browser 3D in Python, Blender and Three.js, with proof files in public repositories.",
  url: `${SITE.url}/`,
  image: `${SITE.url}/og-card.png`,
  email: `mailto:${SITE.email}`,
  address: { "@type": "PostalAddress", addressCountry: "NG" },
  sameAs: [SITE.github],
  knowsAbout: ["Python", "Blender Python", "3D technical art", "Character rigging", "Cloth simulation", "Three.js", "WebGL", "Asset pipelines", "Audio-reactive graphics"],
  subjectOf: READY_PROJECTS.map((p) => ({ "@type": "SoftwareSourceCode", name: p.title, codeRepository: p.repo })),
};

export default function Home() {
  return (
    <DockProgressProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <Nav />
      <DockedMarkBadge />
      <main>
        <Hero />
        <Loop />
        <Projects />
        <Process />
        <HowIWork />
        <Contact />
      </main>
    </DockProgressProvider>
  );
}
