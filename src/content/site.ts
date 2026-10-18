/**
 * Single source of truth for site copy, ported verbatim from the live
 * my-portfolio site (index.html / voltaedge.html, Aug–Sep 2026).
 *
 * Content rules (docs/411-MASTER-PROMPT.md, Part 2) still apply:
 * never invent clients, numbers or shipped capability; planned work stays
 * labelled planned; ₦ prices stay visible.
 */

export const SITE = {
  url: "https://411dev.vercel.app",
  name: "411 Ecosystem",
  owner: "Michael Ikhine",
  email: "411.tmnd@gmail.com",
  github: "https://github.com/411tmnd-star",
  whatsappNumber: "2348155564077",
  locale: "en_NG",
} as const;

/** Prefilled WhatsApp deep link. Text is URL-encoded here, once. */
export function wa(text: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const NAV_LINKS = [
  { href: "/#capability", label: "Capability" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/#architecture", label: "411 Vision" },
  { href: "/#contact", label: "Contact" },
] as const;

export const HERO = {
  eyebrow: "Full-Stack · UI/UX Design · Embedded Systems",
  titleBefore: "Building ",
  titleAccent: "411",
  titleAfter: " — an evolving ecosystem of AI, software & connected hardware.",
  sub: "I build client-facing web applications, responsive UIs, and engineering tools while architecting the 411 ecosystem in Nigeria.",
  primary: {
    label: "Start a project",
    href: wa("Hi Michael — I'd like to start a project with 411. Here's what I have in mind: "),
  },
  secondary: { label: "View Client Services", href: "#services" },
} as const;

export type CapabilityPanel = {
  name: string;
  desc: string;
  stack: string[];
  note?: { before: string; linkLabel: string; href: string; after?: string };
};

export const CAPABILITY = {
  label: "Capability",
  title: "What I actually build",
  sub: "Five layers, from the browser down to the microcontroller. Most projects only need one or two — the point is that they don't have to be handed to different people.",
  panels: [
    {
      name: "Web",
      desc: "Client-facing web applications and the engineering tools around them — from a straightforward business site to booking systems and custom dashboards.",
      stack: ["HTML / CSS / JS", "React", "Responsive UI", "Performance & SEO"],
    },
    {
      name: "UI/UX",
      desc: "Interface and user-flow design, including redesigns of sites that already exist but feel dated or don't convert — without a full rebuild.",
      stack: ["UI/UX Design", "Figma Prototyping", "WCAG Accessibility"],
    },
    {
      name: "AI",
      desc: "Practical AI features — voice search, chat assistants, workflow automation — added where they actually help the business, not for show.",
      stack: ["Model Routing", "Agentic Workflows", "Speaker ID", "NDPA Principles"],
      note: {
        before: "411AOS and 411 Voice are planned architecture, not shipped products — ",
        linkLabel: "see 411 Vision",
        href: "#architecture",
        after: " for what exists today.",
      },
    },
    {
      name: "Embedded",
      desc: "Low-level system design: microcontrollers, firmware, and physical prototyping — the layer most software work never reaches.",
      stack: ["Embedded C/C++", "Microcontrollers", "AutoCAD 3D Prototyping", "Robotics"],
    },
    {
      name: "IoT",
      desc: "Sensors and gateways feeding telemetry into systems that can act on it — monitoring solar infrastructure, power stability, and device health.",
      stack: ["IoT Sensors & Gateways", "Telemetry", "TinyML / NILM"],
      note: {
        before: "VoltaEdge is a concept and prototype architecture — ",
        linkLabel: "read the full breakdown",
        href: "/voltaedge",
        after: ".",
      },
    },
  ] satisfies CapabilityPanel[],
};

export type Service = {
  name: string;
  priceLabel: string;
  price: string;
  per?: string;
  desc: string;
  includes: string[];
  terms: string[];
  waText: string;
};

export const SERVICES = {
  label: "Services",
  title: "What you get when you hire me",
  sub: "Clear services, straightforward starting rates. Pick what you need — the technology underneath is my problem, not yours.",
  disclaimer: "* Final pricing depends on scope, integrations, and delivery requirements.",
  items: [
    {
      name: "Website / Web App",
      priceLabel: "Starting from",
      price: "₦150,000",
      desc: "A fast, mobile-ready site or app built around what your business actually needs.",
      includes: [
        "Fast, mobile-ready build",
        "From a simple business site to booking systems",
        "Custom dashboards where you need them",
      ],
      terms: ["1–2 weeks turnaround", "2 revision rounds"],
      waText: "Hi Michael — I'd like a Website / Web App (from ₦150,000). Here's what my business needs: ",
    },
    {
      name: "UI/UX Redesign",
      priceLabel: "Starting from",
      price: "₦100,000",
      desc: "Already have a site that feels dated or doesn't convert? I redesign the interface and user flow without a full rebuild.",
      includes: ["Interface redesign of your existing site", "User-flow rework", "No full rebuild required"],
      terms: ["3–5 days turnaround", "2 revision rounds"],
      waText: "Hi Michael — I'd like a UI/UX Redesign (from ₦100,000). My current site is: ",
    },
    {
      name: "AI Integration",
      priceLabel: "Starting from",
      price: "₦400,000",
      desc: "Practical AI features added where they actually help your business, not for show.",
      includes: ["Voice search", "Chat assistants", "Workflow automation"],
      terms: ["2–4 weeks turnaround", "3 revision rounds"],
      waText: "Hi Michael — I'm interested in AI Integration (from ₦400,000). What I'd want it to do: ",
    },
    {
      name: "Performance & SEO Audit",
      priceLabel: "Starting from",
      price: "₦50,000",
      desc: "A review of load speed, mobile performance, and basic SEO health.",
      includes: [
        "Load-speed review",
        "Mobile performance check",
        "Basic SEO health check",
        "Prioritised list of what to fix first",
      ],
      terms: ["2–4 days turnaround", "1 revision round"],
      waText: "Hi Michael — I'd like a Performance & SEO Audit (from ₦50,000). My site is: ",
    },
    {
      name: "Maintenance & Support",
      priceLabel: "Ongoing",
      price: "₦50,000",
      per: " / month",
      desc: "Updates, fixes, and small changes handled for you — so you're never stuck when something breaks.",
      includes: [
        "Updates and fixes handled for you",
        "Small changes on request",
        "A person to call when something breaks",
      ],
      terms: ["Monthly ongoing SLA", "24-hr emergency response"],
      waText: "Hi Michael — I'd like to talk about Maintenance & Support (₦50,000/month) for: ",
    },
  ] satisfies Service[],
};

export const ABOUT = {
  label: "About",
  title: "Engineering Digital & Physical Impact",
  paragraphs: [
    "I’m Michael Ikhine, a software and hardware developer building the **411 Ecosystem**.",
    "My work bridges low-level system design—embedded C/C++, microcontrollers, IoT telemetry, and AutoCAD 3D modeling—with high-level web platforms, user-first UI/UX design systems, and the localized AI systems I'm building toward.",
    "Whether delivering client software or developing 411's core OS layer, I focus on practical, privacy-first infrastructure designed for real-world deployment.",
  ],
};

export type EcoLayer = {
  num: string;
  name: string;
  status: "live" | "plan";
  statusLabel: string;
  desc: string;
  nodes: { label: string; key?: boolean }[];
  linkBelow?: string;
};

export const ECOSYSTEM = {
  label: "System Vision",
  title: "411 Ecosystem Architecture",
  sub: "A modular engineering architecture designed to link model orchestration, localized audio search, and hardware telemetry.",
  layers: [
    {
      num: "Layer 01",
      name: "Physical",
      status: "plan",
      statusLabel: "Concept & prototype",
      desc: "Sensing and on-device inference. Current and voltage taps feed a microcontroller running embedded C/C++, with TinyML classifying appliance-level load locally — so the link upstream carries readings, not raw waveforms.",
      nodes: [
        { label: "CT / Voltage Sensors", key: true },
        { label: "ESP32-S3", key: true },
        { label: "Embedded C/C++" },
        { label: "TinyML / NILM" },
      ],
      linkBelow: "Telemetry",
    },
    {
      num: "Layer 02",
      name: "System",
      status: "plan",
      statusLabel: "Planned architecture",
      desc: "Ingest, state and orchestration. Device telemetry lands here; 411AOS is the planned layer for contextual memory, multi-model routing and task execution. Designed with Nigerian data-protection requirements in mind — not claimed as compliant today.",
      nodes: [
        { label: "Telemetry Ingest", key: true },
        { label: "411AOS", key: true },
        { label: "Model Routing" },
        { label: "Agentic Workflows" },
        { label: "NDPA Principles" },
      ],
      linkBelow: "State & events",
    },
    {
      num: "Layer 03",
      name: "Interface",
      status: "live",
      statusLabel: "Shipping today",
      desc: "What a client actually touches: dashboards, web applications and the interface work I deliver now. This is the only layer of the stack already running in production for clients — the two above it are where 411 is heading.",
      nodes: [
        { label: "Web App / Dashboard", key: true },
        { label: "React" },
        { label: "HTML / CSS / JS" },
        { label: "Responsive UI" },
        { label: "WCAG Accessibility" },
      ],
    },
  ] satisfies EcoLayer[],
  foot: {
    before: "Layers 01 and 02 are design and prototype work, not shipped products. The clearest worked example is ",
    linkLabel: "VoltaEdge",
    href: "/voltaedge",
    after: ", which traces one signal from the sensor to the screen.",
  },
};

export const WORK = {
  aos: {
    tag: "[PLANNED ARCHITECTURE · AI INFRASTRUCTURE]",
    title: "411AOS — Planned Agent Orchestration Layer",
    desc: "The planned central orchestration layer for contextual memory, multi-model routing (OpenAI, Anthropic, open-source), user state, and task execution. Designed with Nigerian data-protection requirements in mind; formal compliance depends on the final system, data flows, and deployment context.",
    pills: ["Agentic Orchestration", "Model Routing", "NDPA Principles"],
  },
  voice: {
    tag: "[PLANNED ARCHITECTURE · LOCALIZED VOICE AI]",
    title: "411 Voice — Nigerian-Language Speech",
    langs: ["English", "Pidgin", "Igbo", "Hausa", "Yoruba"],
    caption: "Target languages — none shipped yet.",
    desc: "A speech layer aimed at natural spoken interaction in Igbo, Hausa, and Yoruba alongside English and Pidgin — so more Nigerians can use AI in the language they actually speak at home, not just English. Early-stage direction, built on the speaker-verification groundwork from the VoiceAnalysis project. No dedicated AI law exists in Nigeria yet, though the proposed National Digital Economy and E-Governance Bill would introduce a risk-based AI framework once passed — this is being tracked and designed for, not claimed as compliant today.",
    pills: ["Speech AI", "Regulatory-Aware Design"],
  },
  volta: {
    tag: "[SYSTEM DESIGN · EMBEDDED & HARDWARE]",
    title: "VoltaEdge AI — Physical Intelligence",
    frameTitle: "voltaedge_telemetry.sys",
    flow: ["CT Sensors", "ESP32 Edge AI", "AOS Telemetry"],
    desc: "System architecture exploring how embedded C/C++ microcontrollers, TinyML load recognition, and IoT sensors connect to telemetry systems for monitoring solar infrastructure, power stability, and device health.",
    pills: ["Embedded C/C++", "TinyML / NILM", "IoT Energy"],
    link: { label: "Explore VoltaEdge Architecture →", href: "/voltaedge" },
  },
  next: {
    tag: "[NEXT CASE STUDY]",
    title: "Currently taking on new web development projects",
    desc: "The next case study goes here — client web apps, UI/UX builds, and voice-integrated demos. If you've got a project in mind, let's talk.",
    cta: { label: "Message me on WhatsApp", href: wa("Hi Michael — I saw 411 and I have a project in mind: ") },
  },
  roadmap: [
    { when: "NOW", what: "Client Web Apps & UI/UX" },
    { when: "NEXT", what: "411AOS Core" },
    { when: "LATER", what: "Energy Hardware & Robotics" },
  ],
};

export const CONTACT = {
  title: "Let’s build together.",
  sub: "Need a web application, a UI/UX redesign, or an embedded system? Send one message with what you're building — no forms, no waiting on email.",
  cta: { label: "Message me on WhatsApp", href: wa("Hi Michael — I'd like to discuss a project with 411: ") },
  footer: "411 Ecosystem · Engineered by Michael Ikhine · Based in Nigeria",
};
