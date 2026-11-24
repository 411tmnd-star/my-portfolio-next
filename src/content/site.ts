import { STUDIO_URL } from "./projects";

/** Site-wide copy. Project copy and every number live in projects.ts. */
export const SITE = {
  url: "https://411dev.vercel.app",
  name: "Michael Ikhine",
  owner: "Michael Ikhine",
  role: "Python, 3D Technical Art & Graphics Pipeline Engineer",
  email: "411.tmnd@gmail.com",
  github: "https://github.com/411tmnd-star",
  locale: "en_NG",
} as const;

export const NAV_LINKS = [
  { href: "/#engine", label: "Live engine" },
  { href: "/#projects", label: "Projects" },
  { href: "/#process", label: "Process" },
  { href: "/#how", label: "How I work" },
  { href: "/#contact", label: "Contact" },
] as const;

export const HERO = {
  name: SITE.name,
  role: SITE.role,
  actions: [
    { label: "GitHub", href: SITE.github },
    { label: "Live 3D Studio", href: STUDIO_URL },
  ],
} as const;

export const ENGINE = {
  eyebrow: "411 · project pipeline",
  title: "Live engine",
  captions: ["Assemble", "Activate", "Automate"],
  opening: { title: "Engine online", line: "Five public projects, each with its proof" },
} as const;

export const PROCESS = {
  eyebrow: "Process",
  title: "Wireframe, clay, final",
  sub: "One scene, one locked camera, one frame. Scroll to wipe from the edges to the surfaces to the finished materials.",
  passes: [
    { key: "wire", label: "Wireframe", src: "/media/process-wire.webp", alt: "The engine scene as thin cyan edges on charcoal" },
    { key: "clay", label: "Clay", src: "/media/process-clay.webp", alt: "The same frame in one matte charcoal material" },
    { key: "final", label: "Final", src: "/media/process-final.webp", alt: "The same frame with its amber and cyan materials" },
  ],
} as const;

const ROBOT_DOCS = "https://github.com/411tmnd-star/Humanoid-Robot/blob/16fe21d7ba1229fa5c9cd6caa305f4c335d9836b/docs";

export const HOW = {
  eyebrow: "How I work",
  title: "Two checks that could not fail",
  sub: "A passing test is worth something only if it can also fail. Both of these passed while the robot was wrong.",
  items: [
    {
      title: "The hands were wrong and no check failed",
      body: "Early checks compared bone positions, not mesh shape. Copying a pose between bones with different rest frames turned the fingers while every bone stayed where it should be. The fix measures the mesh itself.",
      link: { label: "Read the fix", href: `${ROBOT_DOCS}/phase_v18_refine.md` },
    },
    {
      title: "A comparison that passed for the wrong model",
      body: "The first browser comparison also passed for an older robot, because the boxes it measured did not include the parts that had changed. New measurements were added, and the wrong model now fails.",
      link: { label: "Read the fix", href: `${ROBOT_DOCS}/phase_v20_refine.md` },
    },
  ],
} as const;

export const CONTACT = {
  title: "Contact",
  sub: "For roles and technical questions. Code and proof files are on GitHub.",
  footer: "Michael Ikhine",
  earlier: { label: "Earlier concept work", href: "/voltaedge" },
} as const;
