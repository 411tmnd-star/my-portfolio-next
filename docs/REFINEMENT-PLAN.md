# 411 Portfolio — Full Refinement Plan

**Agreed:** 2026-10-18 · **Owner:** Michael Ikhine
**Repos:** `my-portfolio` (live static site, 411dev.vercel.app) → `my-portfolio-next` (this repo, continues it)
**3D source:** `Humanoid-Robot` (Blender 5.2, `robot_armature_v15.blend`)

The portfolio shows Michael's whole creation as a developer. Framing stays
"Michael Ikhine — hire me", with 411 as what he is building. Every step ships
on its own branch → Vercel preview → PR.

## Steps

| # | Step | Where it runs | Status |
|---|---|---|---|
| 1 | Move the live site into Next: all copy, ₦ services + WhatsApp CTAs, 3-layer ecosystem, work cards, VoltaEdge page, metadata, redirects | this repo | **Done — PR `merge/live-content-into-next`** |
| 2 | Blender workflows: W0 fix the misplaced thumb (QA-003), W1 web export (`.glb` + poster), W2 reel render | Claude Code + Blender MCP on the laptop, supervised from chat | Next |
| 3 | 3D hero: poster → R3F humanoid swap, greeting on the visor, cursor look-at, mobile "Wake 411" tap | this repo | After W1 |
| 4 | Scroll poses + the reel section (Blender reel of the work) | this repo | After W2 |
| 5 | Switch Vercel to this repo; keep `/voltaedge.html` redirect | Vercel | After step 3 passes the budget |
| — | Phase 2 polish: light/dark toggle, ecosystem motion, Process wipe with real renders | this repo | Later |

## Hero decisions (locked)

- **The robot is Michael's own humanoid** (`Humanoid-Robot`), not a drawn mascot.
- **Five poses:** idle/breathe (loop), hello wave (load), present (Services), point (WhatsApp/contact CTA), rest/bow (Contact).
- **Live layer:** head/neck look-at clamped to the cursor, visor blink as emission pulse, HELLO → 411 on the visor via a canvas texture.
- **Loading:** a Blender poster render from the web camera paints first (LCP); 3D swaps in on idle. Desktop auto-loads; **mobile shows the poster with a "Wake 411" tap**. Reduced motion / no WebGL: poster + all copy.
- **Fix the thumb before export** (QA-003 — the wave hand is the close-up).
- **Loop section = a Blender reel of the work.** Hidden until the encodes exist (`REEL.ready` in `src/components/sections/Loop.tsx`).

Interface contract for the 3D asset: [`hero-3d/HERO-3D-CONTRACT.md`](hero-3d/HERO-3D-CONTRACT.md).

## What step 1 changed (for review)

- `src/content/site.ts`, `src/content/voltaedge.ts` — every string from the live site, verbatim, in one place.
- Sections: Hero (interim SVG greeting, same state machine), Capability (scroll emphasis), Services, About, Ecosystem (3 honest layers), Work (411AOS, 411 Voice, VoltaEdge, next-case-study tile, roadmap), Contact + footer, accessible mobile drawer.
- Removed the scaffold's 8-product grid and "In progress" AOS label: the live site's honest 3 layers win (content rule: planned stays planned).
- `/voltaedge` page + permanent redirects `/voltaedge.html → /voltaedge`, `/index.html → /`.
- Metadata, OG/Twitter cards, `Person` JSON-LD, `sitemap.xml`, `robots.txt`, favicon.
- Fonts self-hosted from `src/app/fonts` (build no longer depends on reaching Google Fonts).
- ESLint 9 flat config (the old `.eslintrc.json` was ignored by ESLint 9, so `npm run lint` failed).
- VoltaEdge app mockup now carries a visible "Design mockup — illustrative figures, not live data" caption.
- Loop and Process are not mounted until real renders exist — no placeholders ship.
