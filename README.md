# Michael Ikhine, portfolio (Next.js)

Portfolio of Michael Ikhine, Python, 3D Technical Art & Graphics Pipeline Engineer. The home page is a compact hero whose 411 mark rides down into a real-time isometric stage, followed by five public projects. Every number on it links to the file that proves it.

## Run it

```
npm ci
npm run dev          # http://localhost:3000
npm run build
npm run lint
npm run typecheck
npm test             # unit tests, no browser
npm run test:e2e     # the seven gates, in software WebGL (needs Chromium from Playwright 1.64.1)
```

## Where things live

| Path | What |
|---|---|
| `src/content/projects.ts` | Every project and number. The build fails when a number has no `proofUrl` |
| `src/content/site.ts` | All other copy |
| `src/components/mark/` | The 411 mark behind one slot. Change `ACTIVE_MARK` and hero, hub and badge follow |
| `src/components/hero/` | Compact hero, dock maths, corner badge |
| `src/components/engine/timeline.ts` | The 12 second loop as pure functions of time |
| `src/components/engine/layout.ts` | Board, trace, stations and the locked isometric camera |
| `src/components/engine/model.ts` | The scene in plain Three, with its wire, clay and final passes |
| `src/components/sections/` | Stage, projects, process, how I work, contact |
| `scripts/capture.mjs` | Stills, loop, rig poster and social cards, captured from the running page |
| `e2e/gates.spec.ts` | Fold, dock, period, register, content, weight, accessibility |

## The stage

- Every object is a function of `t`. `/?t=6.0` freezes a frame, `/?t=6.0&pass=wire` or `&pass=clay` shows the other passes.
- The loop waits, assembled, until the mark has docked. Then it runs: Assemble, Activate, Automate, teardown, hold.
- Desktop with WebGL2 gets the live scene, after first paint. Phones get a poster and a captured loop, reduced motion gets the poster, no WebGL2 gets an SVG diagram. Without JavaScript the stations are a plain list.
- The robot is Humanoid-Robot v20 at its rest pose. It has no walk cycle, so it rides a carrier.

`public/draco/` holds the Draco decoder from three.js (Apache-2.0). Space Grotesk and JetBrains Mono are OFL-1.1.

## Rules

- No number without a public proof link. No client names, prices, phone numbers or performance scores.
- Motion is an enhancement: every section reads with JavaScript off and with reduced motion.

Contact: 411.tmnd@gmail.com, [@411tmnd-star](https://github.com/411tmnd-star)
