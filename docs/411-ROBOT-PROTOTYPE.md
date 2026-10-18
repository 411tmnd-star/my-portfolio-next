# Robot Greeting — Prototype Evaluation

**File:** `prototype/robot.html` · **Status:** built, awaiting your verdict
**Not linked from the site. `noindex, nofollow`. Nothing in production imports it.**

Open it locally and click **Replay** in the bottom-left panel to watch the sequence again, or **Reduced motion** to see the no-motion version.

---

## The numbers

| | |
|---|---|
| Total page | **18.4 KB raw · 5.9 KB gzipped** |
| Dependencies | **Zero.** No Three.js, no GSAP, no WebGL, no image or font files. |
| Network requests | **0** beyond the HTML itself |
| Budget set in the master prompt | ≤ 500 KB · **used ~1.2%** |

For scale, `index.html` is 30 KB. The entire robot — art, animation, interaction — costs **less than two-thirds of the existing homepage**, and it is inline, so it adds no round trips. On a metered Nigerian mobile connection this is effectively free, which is the whole reason we chose SVG over WebGL.

## What it does

```
idle ──► noticing ──► illuminating ──► HELLO ──► 411 ──► revealed ──► tracking
```

1. **Idle** — head turned slightly away, visor dark, slow breathing (5.2s), no glow.
2. **Trigger** — the first of `pointermove` / `scroll` / `touchstart` / `keydown`. If the visitor does nothing, it arrives on its own after 1.4s so it never depends on input. **No camera, no face tracking, no biometrics** — the brief ruled those out and nothing here goes near them.
3. **Noticing** — the head turns to face the viewer over 0.9s.
4. **Illuminating** — faceplate glow, amber sensors, ambient light in the scene.
5. **HELLO** then **411** inside the visor. The eyes fade out while it speaks, so text and eyes never overlap on the same surface.
6. **Revealed** — eyes return; headline, capability pills and subhead stagger in.
7. **Tracking** — on a fine pointer, the head and eyes follow the cursor with eased lerp, clamped to ±16px / ±9px. Small enough to read as attention, not as a cartoon. Blink every ~5.2s.

**Scroll:** the robot fades to 25%, lifts slightly and looks down toward the next section. Normal scrolling is never intercepted — no hijacking, no locked animation.

## Accessibility

- `prefers-reduced-motion` gives the **complete story with no movement**: lit face, `411` in the visor, all copy revealed, no breathing, no tracking, no transitions. The greeting is preserved, per the brief.
- The SVG carries `role="img"` and a plain-language label.
- All copy is real DOM text — selectable, translatable, readable by a screen reader, and present regardless of animation state.
- The greeting is fully readable with sound off. There is no audio at all.
- Nothing is gated behind the animation: if JS fails entirely, the markup still renders the robot and all copy (they start at `opacity:0` — see *Known gap* below).

## Performance behaviour

- Transform and opacity only — no layout thrash, no repaint storms.
- `requestAnimationFrame` loop **self-terminates** when the head reaches its target, rather than running forever.
- Scroll handler is rAF-throttled with a `ticking` guard and `{passive:true}`.
- Blinking and the rAF loop **stop on `visibilitychange`** when the tab is hidden.
- Cursor tracking is skipped entirely on coarse pointers, so phones never run it.
- Mobile gets a smaller robot (250px vs 440px) and a slower breath.

## Known gap before this ships — **RESOLVED at integration**

**The copy starts at `opacity:0` and is revealed by JS.** If JavaScript fails, the headline never appears. That is fine for a prototype and **not** fine for production.

Fixed in `index.html`: the hero's base CSS state is now the *resting* robot — face lit, no greeting, all copy visible. The intro only exists inside `.hero.intro`, a class **only JS adds**. No JS, no intro, complete hero. There is also a 6s safety timeout that force-reveals the copy if the sequence ever stalls mid-way. Verified by rendering the page with JavaScript disabled.

This file's own prototype still has the original gap — it is kept as the record of what was evaluated.

Two smaller notes:
- The bottom-left panel is prototype-only chrome. Delete it on integration.
- The 1.4s auto-arrival needs a real-device check: it feels right in testing, but on a slow phone where paint lands late it may fire before the visitor has actually looked at the screen.

## What I'd ask you to judge

1. **Does it feel premium or does it feel like a toy?** This is the one that matters. It is deliberately restrained — small movements, no neon, no giant glowing eyes. If it reads as too plain, the fix is art direction (helmet silhouette, visor detail), not more animation.
2. **Is the 411 identity there?** It is currently a geometric helmet with a visor. It is original — not an Optimus copy — but it is not yet distinctively *411*.
3. **Is the greeting timing right?** ~3.5s from arrival to full reveal. Long enough to land, or too slow for someone who came to check your prices?
4. **Does it earn its place on the homepage**, given the site's whole positioning is honest, fast and low-bandwidth?

If the answer to 4 is yes, the next step is integration into `index.html` behind the progressive-enhancement fix above. If it is no, we have lost one file and nothing else — which was the point of building it contained.
