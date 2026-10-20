# 411 — Michael Ikhine's portfolio (Next.js)

Personal portfolio and client-services site for **Michael Ikhine**, a software
and hardware developer building the **411 Ecosystem** in Nigeria. This repo
continues the live static site (`my-portfolio`, deployed at
https://411dev.vercel.app) and takes over from it once the 3D hero lands.

Plan and status: [`docs/REFINEMENT-PLAN.md`](docs/REFINEMENT-PLAN.md)

## Run it

```
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Where things live

| Path | What |
|---|---|
| `src/content/site.ts` | All homepage copy: hero, capability, ₦ services, ecosystem, work, contact. Edit text here, not in components. |
| `src/content/voltaedge.ts` | VoltaEdge case-study copy |
| `src/components/sections/` | One component per section, in page order |
| `src/components/hero/` | Hero stage: interim SVG robot + greeting state machine (the 3D humanoid replaces the SVG in step 3) |
| `src/app/voltaedge/` | `/voltaedge` (old `/voltaedge.html` redirects here) |
| `src/app/fonts/` | Self-hosted Space Grotesk + JetBrains Mono (OFL-1.1) |
| `docs/411-MASTER-PROMPT.md` | Content rules and performance budget — still the gate for every PR |
| `docs/hero-3d/HERO-3D-CONTRACT.md` | What the Blender export must deliver for the 3D hero |
| `docs/411-ROBOT-PROTOTYPE.md`, `docs/prototype/robot.html` | Record of the SVG greeting prototype |

## Rules that carry over from the live site

- Never invent clients, numbers or shipped capability; planned work stays labelled planned.
- ₦ prices stay visible; every conversion is one WhatsApp message with prefilled text.
- Every section is readable with JavaScript off; motion is an enhancement, `prefers-reduced-motion` removes movement but never content.
- Homepage ≤ 500 KB transfer on mobile, LCP ≤ 2.5 s on Slow 4G.

## Palette

Dark "Board" theme by default (`src/app/globals.css`). Copper = material,
cyan = signal. A light "Clay" theme exists behind `data-theme="light"`; the
toggle ships in Phase 2.

## Contact

WhatsApp (from the site's CTAs) · 411.tmnd@gmail.com · [@411tmnd-star](https://github.com/411tmnd-star)
