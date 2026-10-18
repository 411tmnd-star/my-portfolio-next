# 411 — MASTER BUILD PROMPT

> **Decision update — 2026-10-18 (supersedes Decisions 1 and 2 below).**
> The site moves from vanilla static HTML to **Next.js 15** (`my-portfolio-next`),
> which continues the live `my-portfolio` site. The hero robot becomes
> **Michael's own 3D humanoid** (the `Humanoid-Robot` Blender project) rendered
> with React Three Fiber, replacing the SVG greeting; the SVG holds the hero
> until the 3D lands. Decisions 3 (WhatsApp, no payments) and 4 (personal
> portfolio, "hire me") stand. Part 2's standing rules — content integrity,
> preservation, the performance budget, accessibility — still apply and are
> the gate for every PR. Plan: [`REFINEMENT-PLAN.md`](REFINEMENT-PLAN.md).

**Status:** Draft for review by Michael Ikhine. Nothing here has been implemented.
**Purpose:** One canonical brief that replaces the five separate prompts. Read Part 1, answer the four decisions, then this becomes the working contract.

---

## PART 0 — GROUND TRUTH (audit already done, do not redo it)

The original prompts told an agent to "audit the framework, package manager, build system, routing, styling system, component architecture, animation libraries, asset pipeline." There is none of that. Here is the entire project:

```
my-portfolio/
├── index.html      556 lines, 27 KB
└── voltaedge.html  330 lines, 16 KB
```

That is the whole repository. No `package.json`, no framework, no build step, no `vercel.json`, no `/public`, no `/api`, no image assets, no fonts, no dependencies of any kind. Two hand-written HTML files with inline `<style>` and one inline `<script>`, deployed to Vercel as static files.

**This is not a weakness to apologise for.** It loads fast, it has zero supply chain, and it is honest. But it means every phase in the original prompts that assumed an existing codebase to preserve is void, and the two hardest asks — a 3D robot and server-verified payments — collide with the architecture head-on. Part 1 resolves that.

### What actually exists

| | |
|---|---|
| **Brand** | 411, "by Michael Ikhine" |
| **Palette** | `--bg #0c0e12`, `--panel #14171d`, `--panel-2 #191c23`, `--ink #edf0f5`, `--ink-dim #93989e`, `--cyan #4fd1c5`, `--amber #f5a623` |
| **Type** | `index.html`: system font stack, with an explicit comment: *"no external font requests, keeps the low-bandwidth claim honest"* |
| **Sections** | Hero · Services · About & Stack · 411 Ecosystem Architecture · Contact |
| **Nav** | Sticky header, JS-synced `--header-height`, mobile drawer with `aria-expanded` / `aria-controls`, Escape-to-close, click-outside-to-close |
| **Motion** | One `@keyframes pulse` on a mockup mic dot. That's it. |
| **A11y** | `prefers-reduced-motion` block already present in `index.html` |
| **Conversion** | `mailto:411.tmnd@gmail.com`, `wa.me/2348155564077`, GitHub link. **No form exists anywhere.** |
| **Pricing** | Real ₦ figures on all 5 services, with a scope disclaimer |
| **VoltaEdge** | Its own page: problem → intelligence layer → consumer UI → NILM → specs → dev status |

### Four defects found

1. **Broken social preview.** `index.html` points `og:image` at `https://411.engineering/og-card.png` and `og:url` at `https://411.engineering`. No such file is in the repo, and the live site is `411dev.vercel.app`. Every WhatsApp / X / LinkedIn share is currently rendering a broken or blank card. *This is the highest-ROI fix in the entire document and it takes ten minutes.*
2. **`voltaedge.html` contradicts the low-bandwidth stance.** It loads Inter + JetBrains Mono from Google Fonts while `index.html` deliberately avoids external font requests. One of the two pages is lying about the position. Pick one and apply it to both.
3. **No canonical, no sitemap, no robots, no structured data.**
4. **The two pages have diverged.** Header, palette variables and type are near-duplicated with drift. Any third page makes this worse.

### What the existing content gets right — protect this

The copy already refuses to fabricate. `[PLANNED ARCHITECTURE]` tags on 411AOS and 411 Voice. An honest empty-state tile — *"The next case study goes here"* — instead of an invented client. Explicit hedging on NDPA and the pending National Digital Economy and E-Governance Bill rather than a compliance claim. A pricing disclaimer.

That restraint is the most valuable asset in the repository. A visitor who can tell the difference will trust it, and those are the visitors who pay. **No redesign may soften it into marketing language.**

---

## PART 1 — FOUR DECISIONS — **ANSWERED 2026-08-23**

| | Decision | Consequence |
|---|---|---|
| **1** | **Stay vanilla static.** No Astro until server endpoints are strictly necessary. | No build step, no lockfile, no npm. Shared code stays duplicated across pages by hand. |
| **2** | **SVG robot, ~40 KB target, prototyped at `/prototype/robot.html`. No WebGL.** | Delivered at **18.4 KB / 5.9 KB gzipped**. See `411-ROBOT-PROTOTYPE.md`. |
| **3** | **WhatsApp for conversion. No payment button, no intake form.** | Paystack/Flutterwave are **out of scope** — which is what made Decision 1 viable, since server-side verification was the only thing that required a server. |
| **4** | **Personal portfolio — "hire me".** `Person` structured data. | Copy keeps first-person voice and visible ₦ rates. No company framing. |

Decisions 1 and 3 reinforce each other: with no payments there is no server requirement, so static holds. **If payments ever come back, Decision 1 must be reopened first** — a client-side "success" callback is forgeable and must never be treated as proof of payment.

The original analysis behind each fork is kept below for the record.

---

### The forks as originally framed

### Decision 1 — Stay static, or adopt a real project?

Payments are the forcing function. Paystack and Flutterwave both require **server-side verification** — a client-side "success" callback is trivially forged by anyone with devtools, and treating it as proof of payment is how you get robbed. Verification needs a server. Two static HTML files have no server.

| | **A. Stay vanilla static** | **B. Adopt Astro or Next.js on Vercel** |
|---|---|---|
| Payments | Impossible to do safely. Manual invoicing only. | `/api` routes verify server-side. Real. |
| Shared header/palette | Keeps duplicating per page | Solved by components |
| Build step | None. Edit, push, live. | npm, lockfile, CI, dependency upgrades |
| Bundle | ~27 KB | ~90 KB baseline before you write anything |
| Honesty of "low-bandwidth" | Fully intact | Defensible with discipline |

**My recommendation: B, using Astro.** It ships zero JavaScript by default, so the low-bandwidth claim survives; it supports Vercel serverless functions for payment verification; and it lets the header and design tokens live in one place instead of two. Next.js is heavier than this site needs unless a dashboard is coming.

If payments can wait, **A is genuinely defensible** and you should not migrate for aesthetics alone.

### Decision 2 — Does the robot survive contact with your actual audience?

The robot concept is strong and it is the most memorable idea in the brief. But be clear-eyed about the collision:

- A WebGL/Three.js robot is **1.5–4 MB** of model, texture and runtime, minimum.
- Your buyers are Nigerian businesses on mid-range Android over metered mobile data.
- Your own homepage currently brags, in a code comment, about not making external font requests.

A site that costs ₦300 of data to load, to prove you build efficient systems, argues against itself.

Three ways through, in ascending cost:

- **SVG/Canvas robot** — under 40 KB, cursor-tracked head, illuminated faceplate, HELLO → 411. Loads instantly on 3G. ~85% of the emotional payoff.
- **Pre-rendered sprite sequence** — model the robot in AutoCAD/Blender, export ~30 frames, scrub them on scroll. ~200 KB, cinematic, no WebGL runtime.
- **Full Three.js on desktop only**, with the SVG version everywhere else and behind `prefers-reduced-motion`. Highest ceiling, highest cost, two implementations to maintain.

**My recommendation: build the SVG/Canvas version first as a standalone prototype page.** If it lands, you have shipped. If it feels thin, you have learned exactly what the 3D version must add, and you have the sprite path as a middle step. Prototype at `/prototype/robot.html`, unlinked from nav — it touches nothing in production.

### Decision 3 — Is a payment funnel premature?

The intake → quote → deposit flow assumes visitors are ready to pay. Right now the site has **zero case studies** — the work grid contains an honest placeholder saying so. A deposit button in front of no proof converts worse than a WhatsApp link, and WhatsApp is how Nigerian clients actually prefer to start.

Sequencing I'd argue for:

1. Fix the OG card. Ship one real case study. *(Highest revenue-per-hour of anything here.)*
2. Intake form → structured lead in your inbox. No payment.
3. Payments **only** once you are turning away work or chasing deposits manually.

The prompt's own flow already says "Do not force payment immediately on every visitor." Push that further: build it when a real client is waiting on it.

### Decision 4 — What is 411, on this site?

The current site is a **personal portfolio** ("by Michael Ikhine", "when you hire me", ₦ rates). The redesign brief describes a **company** ("411 builds intelligent systems"). Those are different sites with different pricing psychology and different trust signals.

Both are legitimate. Pretending to be a company you aren't is not, and the current copy's integrity is the thing worth protecting. **Decide deliberately, then apply it to every line of copy.**

---

## PART 2 — STANDING RULES

Non-negotiable regardless of the decisions above.

**Content integrity.** Never invent clients, testimonials, statistics, revenue, users, partnerships, certifications, awards, case-study results, or shipped capability. Planned work stays labelled planned. Regulatory hedging stays hedged. If information is missing, flag it — do not fill the gap with plausible copy.

**Preservation.** Keep the ₦ pricing, the real contact details, the VoltaEdge page, the honest empty-state tile, the `[PLANNED ARCHITECTURE]` tags, the reduced-motion block, the mobile drawer's accessibility wiring, and the existing URLs. Changing a URL without a redirect discards whatever SEO exists.

**Performance budget — a hard gate, not an aspiration.**
- Homepage ≤ 500 KB total transfer, mobile
- LCP ≤ 2.5s on simulated Slow 4G
- No animation library loaded before first paint
- Heavy assets lazy-load; offscreen animation pauses
- Every dependency justifies itself in writing before install

**Accessibility.** Keyboard reachable, visible focus states, semantic HTML, labelled form fields, AA contrast, alt text. `prefers-reduced-motion` removes movement but never removes content, meaning, or the greeting.

**Security.** No secret keys client-side. No `.env` committed. Payment status is whatever the server says after verifying with the provider — never what the browser claims.

**Never** ship generic AI stock imagery in place of real work, hijack scroll, or animate an element that isn't clarifying something.

---

## PART 3 — THE 01–07 NARRATIVE, MAPPED TO REAL CONTENT

Not a fresh structure — a re-sequencing of what exists, with gaps marked honestly.

| | Section | Source | Status |
|---|---|---|---|
| **01** | Intro — `411 / BUILDING WHAT'S NEXT / WEB · AI · SYSTEMS · HARDWARE` | Existing hero, tightened | Rework |
| **02** | Capability — Web / AI / UI·UX / Embedded / IoT | Existing About & Stack pills | Rework into scroll-driven |
| **03** | Services — 5 services, problem → approach → result → CTA | Existing, prices intact | Improve presentation only |
| **04** | Ecosystem — 411 → AI Core → AOS → Systems | Existing architecture cards | Signature build |
| **05** | 411 Voice — English · Pidgin · Igbo · Hausa · Yoruba | Existing card | Expand, keep hedged |
| **06** | VoltaEdge — Sensor → ESP32 → AI → Telemetry → Action | Existing full page | Reuse, add motion |
| **07** | Conversion — Start a Project | **Does not exist** | Net new |

Two hard constraints on this section:

- **04 is where you win.** Nobody else in this market can draw a credible architecture diagram, because nobody else has actually built across embedded C, telemetry and web. Spend the motion budget here.
- **Section 03 must not lose its prices.** Visible ₦ rates are a conversion advantage over every agency that says "contact us for pricing." Do not bury them behind a quote flow.

---

## PART 4 — THE ROBOT (prototype only)

Contained at `/prototype/robot.html`. Not linked from nav. Nothing in production changes until it is evaluated.

**States:** idle (breathing, restrained — alive, not an advertisement) → visitor interacts (page load, cursor, or first scroll; **never** camera, never face tracking, never biometrics) → head turns to viewer, faceplate illuminates → `HELLO` → `411` → hero typography activates → scroll transition into 411's story with normal browser scrolling fully intact.

**Design:** dark faceplate, minimal luminous eyes, restrained light animation. Original 411 identity — not a cartoon mascot, not an Optimus imitation, no giant glowing eyes, no cyberpunk neon. The greeting must be fully readable with sound off; audio is optional, muted by default, and never autoplays loud.

**The robot is a signature interaction, not the brand.** The visitor should leave remembering *411* — not "the robot website."

**Then stop and report:** how it works, bytes added, dependencies, LCP delta on Slow 4G, mobile behaviour, reduced-motion behaviour, assets required. No further integration until reviewed.

---

## PART 5 — INTAKE & PAYMENTS

**Gated on Decision 1 = B. If A, build intake only and invoice manually.**

Intake collects: name, email, project type (Website · Web App · UI/UX · AI Integration · SEO Audit · Embedded/IoT · Custom · Other), description, budget range, timeline. Nothing more — every extra field costs completions.

```
INQUIRY → QUALIFICATION → QUOTE → APPROVAL → DEPOSIT
        → Paystack / Flutterwave → SERVER-SIDE VERIFY → STATUS → PROJECT
```

Abstract the provider behind one interface so Paystack and Flutterwave are swappable. Keys in env vars, server-side only. One-time deposits first; no recurring billing until the business needs it. **A client-side success message is never proof of payment.**

---

## PART 6 — MOTION DOCTRINE

Scroll drives *meaning*: architecture assembling, data flowing, systems connecting, state changing. Never decorative parallax, never animation on every element, never scroll hijacking.

Pacing: **calm** (intro, trust) → **medium** (capability, services) → **high, used sparingly** (ecosystem, VoltaEdge) → **calm again** (intake, payment).

The contrast between motion and stillness is what reads as premium. Constant motion reads as a template.

> **The rule:** if an animation doesn't improve understanding, emotion, hierarchy or conversion — delete it.

---

## PART 7 — VERIFICATION

A passing build is not a finished section. Screenshot every section at **1440 · 1280 · 768 · 390 · 360**, and scroll-driven sections at 0/25/50/75/100%.

Check: layout breaks, text overlap, horizontal overflow, clipping, animation timing, mobile nav, CTA visibility, focus states, contrast, and LCP on throttled mobile. Fix what the screenshots show before moving on.

---

## PART 8 — SEQUENCE

Small, logical, revertible commits. Never one enormous untraceable commit. Build → test → screenshot → fix → commit → continue.

```
✅ 0. fix: OG card, canonical, sitemap, font consistency      fd8f038
✅ 1. fix: mobile pill + Person structured data               95824f3
✅ 2. prototype: robot greeting (contained, unlinked)
      ── EVALUATED: approved ──
✅ 3. feat: 01 hero            robot integrated, progressive enhancement
✅ 4. refactor: styles.css     shared tokens, reset, header
✅ 5. feat: 02 capability      five layers, scroll-driven emphasis
✅ 6. feat: 04 ecosystem       layered stack, sensor → telemetry → browser
✅ 7. feat: 06 VoltaEdge motion  animated pipeline, CSS-driven
✅ 8. feat: 03 services       price-led cards, scope per card
✅ 9. feat: 07 conversion     every CTA → prefilled WhatsApp
      ← YOU ARE HERE
  10. feat: 05 Voice          deferred to last, static [PLANNED] card only

**Deferred deliberately:** 05 (411 Voice) was pushed to the end so 03 and 07
could ship first — those are the two sections that actually move revenue. When
it lands it stays a static concept card, not a simulated demo: there is no
shipped artefact behind it to demonstrate.
```

**Dropped by the decisions:** the intake form and the entire payment phase (Decision 3), and the Astro migration (Decision 1).

**Still open, deliberately:** with no build step, the header, palette tokens and font stack remain duplicated across `index.html` and `voltaedge.html`. Two files is manageable by hand; a third page makes it a real liability. Worth extracting to a shared `styles.css` before step 3 — one cacheable request, no build step, and it stops the two pages drifting apart again the way the fonts did.

---

## APPENDIX — WHAT NOT TO DO

Do not rebuild from a template. Do not delete working functionality to rebuild it "better." Do not add Three.js, GSAP, React or WebGL by default — earn each one. Do not fabricate proof. Do not shrink desktop into mobile and call it responsive. Do not trust a client-side payment success. Do not change URLs without redirects. Do not let the robot become the brand. Do not stack dozens of untested changes.

And do not let the site's ambition outrun its honesty. **Right now, the honesty is the product.**
