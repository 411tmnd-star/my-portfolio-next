# 411 Portfolio — Next.js rebuild (scaffold)

Next.js 15 + TypeScript + Tailwind v4 rebuild of the 411 ecosystem portfolio.
The live vanilla-HTML site (`my-portfolio/`, deployed at 411dev.vercel.app) is
untouched — this is a fresh sibling project, swapped over on Vercel only once
this rebuild is ready.

Full design/research reference: see the "411 Landing Page — Reference Board"
doc and the `claude/411-reference-board.md` project note.

## Setup

```
npm install
npm run dev
```

## Structure (§0–§7, per the reference board)

- `src/components/sections/Nav.tsx` — §0 sticky translucent nav
- `src/components/sections/Hero.tsx` — §1 circuit-board 411 mark + 4-node ring (AOS, Market, Live, Smart Energy)
- `src/components/sections/Loop.tsx` — §2 the loop video (placeholder — swap in real encodes)
- `src/components/sections/Ecosystem.tsx` — §3 all 8 nodes, honest status
- `src/components/sections/Proof.tsx` — §4 shipped work / case studies
- `src/components/sections/Process.tsx` — §5 wireframe → clay → final scroll wipe (GSAP ScrollTrigger, two-layer clip-path — no image sequence)
- `src/components/sections/About.tsx` — §6 EE + web + 3D hybrid
- `src/components/sections/Contact.tsx` — §7 CTA + footer

## Fonts

Space Grotesk (display) + JetBrains Mono (silkscreen/labels), both self-hosted
via `next/font/google` in `src/app/layout.tsx` — no CDN request, no layout shift.

## Palette

Dark "Board" theme is default (see `globals.css` `@theme` block) — values match
the reference board's recommended palette. Copper = material (traces, pads,
always present). Cyan = signal (emission only — visor, active state).

## Not yet wired

- Hero ring is CSS/DOM placeholder — swap for the real `.glb` (React Three
  Fiber) once the Blender/KiCad geometry exists.
- Loop section has poster-only placeholder — drop in the two video encodes
  (WebM/VP9 + MP4/H.264) once rendered.
- Process section wipe uses solid-color placeholder panels — swap for the
  real wireframe/clay/final renders (same camera, same frame).
