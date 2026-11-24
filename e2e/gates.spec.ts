import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const SIZES = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
];
const DESKTOP = SIZES[0];

async function openLive(page: Page, url = "/") {
  await page.goto(url);
  await expect(page.locator('[data-testid="engine-stage"][data-drawn="true"]')).toBeAttached({ timeout: 120_000 });
}
const engineReady = (page: Page) => page.waitForFunction(() => window.__engine?.ready() === true, null, { timeout: 180_000 });
const box = async (l: Locator) => {
  const b = await l.boundingBox();
  if (!b) throw new Error("no box");
  return b;
};
const heroHeight = (page: Page) => page.getByTestId("hero").evaluate((e) => (e as HTMLElement).offsetHeight);

// ====================================================================== 1. Fold
for (const size of SIZES) {
  test(`gate 1 fold at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/");
    const hero = await box(page.getByTestId("hero"));
    const stage = await box(page.getByTestId("engine-stage"));
    expect(hero.y).toBe(0);
    expect(hero.height / size.height).toBeLessThanOrEqual(0.78);
    expect((size.height - stage.y) / size.height).toBeGreaterThanOrEqual(0.2);
    for (const el of [page.locator("h1"), page.getByRole("link", { name: "GitHub", exact: true }), page.getByRole("link", { name: "Live 3D Studio" })]) {
      await expect(el).toBeInViewport({ ratio: 1 });
      await expect(el).toBeVisible();
    }
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Michael Ikhine Python, 3D Technical Art & Graphics Pipeline Engineer");
  });
}

test("gate 1 the h1 is in the first HTML and is not revealed by animation", async ({ request, page }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("Michael Ikhine");
  expect(html).toContain("Python, 3D Technical Art &amp; Graphics Pipeline Engineer");
  await page.goto("/", { waitUntil: "commit" });
  const style = await page.locator("h1").evaluate((e) => {
    const s = getComputedStyle(e);
    return [s.opacity, s.transform, s.animationName, s.transitionDuration];
  });
  expect(style).toEqual(["1", "none", "none", "0s"]);
});

// ====================================================================== 2. Dock
for (const size of SIZES) {
  test(`gate 2 dock at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    const live = size.width >= 900;
    if (live) await openLive(page);
    else await page.goto("/");
    const badge = page.getByTestId("docked-mark-badge");
    if (live) await expect(badge).toHaveCSS("opacity", "0");
    const h = await heroHeight(page);
    await page.evaluate((y) => window.scrollTo(0, y), h);
    await page.waitForTimeout(600);
    const mark = await box(page.getByTestId("mark-box"));
    const hub = await box(page.getByTestId("hub"));
    const overlapX = Math.min(mark.x + mark.width, hub.x + hub.width) - Math.max(mark.x, hub.x);
    const overlapY = Math.min(mark.y + mark.height, hub.y + hub.height) - Math.max(mark.y, hub.y);
    expect(overlapX).toBeGreaterThan(0);
    expect(overlapY).toBeGreaterThan(0);
    // not just touching: the centres agree to a couple of pixels
    expect(Math.abs(mark.x + mark.width / 2 - (hub.x + hub.width / 2))).toBeLessThan(3);
    expect(Math.abs(mark.y + mark.height / 2 - (hub.y + hub.height / 2))).toBeLessThan(3);
    if (!live) return;
    await expect(badge).toHaveCSS("opacity", "0");
    const bottom = await page.getByTestId("engine-stage").evaluate((e) => e.getBoundingClientRect().bottom + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), bottom - 4); // last pixels of the stage still on screen
    await page.waitForTimeout(600);
    await expect(badge).toHaveCSS("opacity", "0");
    await page.evaluate((y) => window.scrollTo(0, y), bottom + 40);
    await expect(badge).toHaveCSS("opacity", "1");
  });
}

test("gate 2 the travelling mark fades only as the hub mark arrives, and nothing is pinned", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await openLive(page);
  const h = await heroHeight(page);
  const opacity = () => page.getByTestId("hero-mark").evaluate((e) => Number(getComputedStyle(e).opacity));
  await page.evaluate((y) => window.scrollTo(0, y), h * 0.8);
  await page.waitForTimeout(800);
  expect(await opacity()).toBe(1);
  expect((await box(page.getByTestId("hero"))).y).toBeCloseTo(-Math.round(h * 0.8), -1);
  await page.evaluate((y) => window.scrollTo(0, y), h);
  await expect.poll(opacity, { timeout: 40_000 }).toBeLessThan(0.01);
});

// ====================================================================== 3. Period
test("gate 3 period and locked camera", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/?t=0");
  await engineReady(page);
  const worst = await page.evaluate(() => {
    const e = window.__engine!;
    const a = e.snapshot(0);
    const b = e.snapshot(12);
    let max = 0;
    for (const k of Object.keys(a)) a[k].forEach((v, i) => (max = Math.max(max, Math.abs(v - b[k][i]))));
    const mid = e.snapshot(6);
    const moved = Object.keys(a).filter((k) => a[k].some((v, i) => Math.abs(v - mid[k][i]) > 0.05)).length;
    return { max, objects: Object.keys(a).length, moved };
  });
  expect(worst.objects).toBeGreaterThan(18);
  expect(worst.moved).toBeGreaterThan(10);
  expect(worst.max).toBeLessThan(1e-6);

  const cameras: number[][] = [];
  for (let i = 0; i < 10; i++) {
    await page.evaluate((t) => window.__engine!.seek(t), i * 1.2 + 0.05);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    cameras.push(await page.evaluate(() => window.__engine!.camera()));
  }
  for (const c of cameras) expect(c).toEqual(cameras[0]);
  // true isometric: the view direction makes equal angles with all three axes
  const [m8, m9, m10] = cameras[0].slice(8, 11);
  for (const v of [m8, m9, m10]) expect(v).toBeCloseTo(1 / Math.sqrt(3), 9);
});

test("gate 3 the live clock runs after docking and only then", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await openLive(page, "/?debug=1");
  await engineReady(page);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__engine!.time())).toBe(2);
  await page.evaluate((y) => window.scrollTo(0, y), await heroHeight(page));
  await expect.poll(() => page.evaluate(() => window.__engine!.time()), { timeout: 60_000 }).toBeGreaterThan(2.5);
});

// ====================================================================== 4. Register
test("gate 4 the three passes register within one pixel", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/?t=6");
  await engineReady(page);
  const result = await page.evaluate(async () => {
    const W = 1600;
    const H = 1000;
    const mask = async (pass: "wire" | "clay" | "final", t = 6) => {
      const img = new Image();
      img.src = window.__engine!.png(W, H, t, pass);
      await img.decode();
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, W, H).data;
      return Uint8Array.from({ length: W * H }, (_, i) => (d[i * 4 + 3] > 127 ? 1 : 0));
    };
    const grow = (m: Uint8Array) => {
      const out = new Uint8Array(m.length);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          if (m[i]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) out[i + dy * W + dx] = 1;
        }
      }
      return out;
    };
    const outside = (a: Uint8Array, b: Uint8Array) => {
      const g = grow(b);
      let n = 0;
      for (let i = 0; i < a.length; i++) if (a[i] && !g[i]) n++;
      return n;
    };
    const m = { wire: await mask("wire"), clay: await mask("clay"), final: await mask("final") };
    const later = await mask("final", 6.1); // a control: 0.1 s later must NOT register
    const area = (a: Uint8Array) => a.reduce((s, v) => s + v, 0);
    return {
      control: outside(m.final, later) + outside(later, m.final),
      area: { wire: area(m.wire), clay: area(m.clay), final: area(m.final) },
      beyondOnePixel: {
        wireVsClay: outside(m.wire, m.clay) + outside(m.clay, m.wire),
        clayVsFinal: outside(m.clay, m.final) + outside(m.final, m.clay),
        wireVsFinal: outside(m.wire, m.final) + outside(m.final, m.wire),
      },
    };
  });
  console.log("register", JSON.stringify(result));
  expect(result.area.final).toBeGreaterThan(200_000);
  expect(result.control).toBeGreaterThan(50);
  expect(result.beyondOnePixel).toEqual({ wireVsClay: 0, clayVsFinal: 0, wireVsFinal: 0 });
});

test("gate 4 the wipe shows wire, then clay, then final, from stacked images", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  const track = page.locator(".process-track");
  await expect(page.locator(".process")).toHaveAttribute("data-wipe", "true");
  const seen: string[] = [];
  for (const k of [0.02, 0.5, 0.98]) {
    await track.evaluate((e, p) => {
      const r = e.getBoundingClientRect();
      window.scrollTo(0, r.top + window.scrollY + (r.height - window.innerHeight) * p);
    }, k);
    await page.waitForTimeout(500);
    seen.push((await track.getAttribute("data-pass")) ?? "");
  }
  expect(seen).toEqual(["wire", "clay", "final"]);
  for (const img of await page.locator(".process-pass img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((e) => [(e as HTMLImageElement).naturalWidth, (e as HTMLImageElement).naturalHeight])).toEqual([1600, 1000]);
  }
});

// ====================================================================== 5. Content
test("gate 5 no phone number, no messenger link, no prices", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  for (const banned of [/wa\.me/i, /whatsapp/i, /₦/, /naira/i, /tel:/i, /2348155564077/, /Services/, /lighthouse/i, /\bARAP\b/, /reduced[- ]poly/i]) expect(html).not.toMatch(banned);
  await page.goto("/");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\+\d[\d\s().-]{8,}\d|\b0\d{10}\b/);
});

test("gate 5 every metric link answers", async ({ page, request }) => {
  await page.goto("/");
  const links = await page.locator("a[data-metric]").evaluateAll((all) => all.map((a) => (a as HTMLAnchorElement).href));
  expect(links).toHaveLength(15);
  for (const url of new Set(links)) {
    // The host being briefly unavailable (429, 5xx) is asked again. A wrong link (4xx) is not.
    let status = 0;
    for (let i = 0; i < 4; i++) {
      status = (await request.get(url, { timeout: 60_000 })).status();
      if (status !== 429 && status < 500) break;
      console.log(`asked again after ${status}: ${url}`);
      await page.waitForTimeout(5_000 * (i + 1));
    }
    expect(status, url).toBe(200);
  }
});

test("gate 5 the page reads without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: DESKTOP });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByTestId("flat-mark")).toBeVisible();
  await expect(page.locator(".engine-stations a")).toHaveCount(5);
  for (const a of await page.locator(".engine-stations a").all()) {
    await expect(a).toBeVisible();
    await expect(a.locator(".station-line")).toBeVisible();
  }
  await expect(page.locator("a[data-metric]")).toHaveCount(15);
  for (const h of ["Live engine", "Five projects, every number linked to its proof", "Wireframe, clay, final", "Two checks that could not fail", "Contact"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  await expect(page.locator(".process-pass")).toHaveCount(3);
  for (const f of await page.locator(".process-pass").all()) await expect(f).toBeVisible();
  await context.close();
});

for (const size of SIZES) {
  test(`gate 5 no sideways scroll and no console errors at ${size.width}x${size.height}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
    await page.setViewportSize(size);
    if (size.width >= 900) await openLive(page);
    else await page.goto("/");
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("gate 5 no reference file in the build output", async () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk("public");
  walk(path.join(".next", "static"));
  expect(files.length).toBeGreaterThan(20);
  for (const f of files) expect(f).not.toMatch(/veloxa|dribbble|dipa|eleva\b|linea|palermo|off-?white|scarlett|ameera|viktoroddy/i);
  // When the reference folders are on this machine, compare contents as well as names.
  const refs = ["PORTFOLIO_REFERENCE_VELOXA", "PORTFOLIO_REFERENCE_CONTACT_SHEETS"].map((d) => path.join("..", "..", "..", "411_cleaned_library", "00_CLEAN_INDEX", d));
  const hash = (f: string) => createHash("sha256").update(fs.readFileSync(f)).digest("hex");
  const known = new Set(refs.filter((d) => fs.existsSync(d)).flatMap((d) => fs.readdirSync(d).map((f) => path.join(d, f)).filter((f) => fs.statSync(f).isFile()).map(hash)));
  console.log("reference files compared by hash:", known.size);
  for (const f of files) expect(known.has(hash(f)), f).toBe(false);
});

// ====================================================================== 6. Weight
test("gate 6 first-load JavaScript is at most 150 kB", async () => {
  const manifest = JSON.parse(fs.readFileSync(".next/app-build-manifest.json", "utf8")) as { pages: Record<string, string[]> };
  const files = new Set([...manifest.pages["/page"], ...manifest.pages["/layout"]].filter((f) => f.endsWith(".js")));
  const bytes = [...files].reduce((sum, f) => sum + gzipSync(fs.readFileSync(path.join(".next", f))).length, 0);
  console.log("first-load JS, gzip bytes:", bytes);
  expect(bytes).toBeLessThanOrEqual(150 * 1000);
  for (const f of files) expect(fs.readFileSync(path.join(".next", f), "utf8")).not.toContain("WebGLRenderer");
});

test("gate 6 Three, Fiber and the models load after first paint", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  const late: { url: string; three: boolean }[] = [];
  page.on("response", async (r) => {
    if (r.url().endsWith(".glb")) late.push({ url: r.url(), three: false });
    else if (r.url().endsWith(".js") && (await r.text().catch(() => "")).includes("WebGLRenderer")) late.push({ url: r.url(), three: true });
  });
  await openLive(page);
  await expect.poll(() => late.some((l) => l.url.includes("robot_v20")), { timeout: 60_000 }).toBe(true);
  const paint = await page.evaluate(() => performance.getEntriesByName("first-contentful-paint")[0].startTime);
  const starts = await page.evaluate(() => Object.fromEntries((performance.getEntriesByType("resource") as PerformanceResourceTiming[]).map((e) => [e.name, e.startTime])));
  expect(late.some((l) => l.three)).toBe(true);
  for (const l of late) expect(starts[l.url], l.url).toBeGreaterThan(paint);
});

test("gate 6 the captured loop is under 2 MB in both formats, silent, 12 seconds", async ({ page }) => {
  for (const f of ["engine-loop.mp4", "engine-loop.webm"]) expect(fs.statSync(path.join("public/media", f)).size).toBeLessThan(2_000_000);
  await page.setViewportSize(SIZES[3]);
  await page.goto("/");
  await page.getByTestId("engine-stage").scrollIntoViewIfNeeded();
  const video = page.locator("video.engine-poster");
  await expect(video).toBeAttached();
  await expect.poll(() => video.evaluate((v) => (v as HTMLVideoElement).duration), { timeout: 30_000 }).toBeCloseTo(12, 0);
  expect(await video.evaluate((v) => (v as HTMLVideoElement).muted)).toBe(true);
});

// ====================================================================== 7. Accessibility, fallbacks
for (const [name, url, size, motion] of [
  ["desktop, live", "/?t=6", DESKTOP, "no-preference"],
  ["phone", "/", SIZES[3], "no-preference"],
  ["reduced motion", "/", DESKTOP, "reduce"],
] as const) {
  test(`gate 7 axe finds nothing: ${name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: motion });
    if (url.includes("t=")) await openLive(page, url);
    else await page.goto(url);
    await page.waitForTimeout(800);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ; ")}`)).toEqual([]);
  });
}

test("gate 7 fallbacks: no WebGL2 gets the diagram, reduced motion gets the poster", async ({ browser }) => {
  const a = await browser.newPage({ viewport: DESKTOP });
  await a.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() => null) as never;
  });
  await a.goto("/");
  await expect(a.getByTestId("engine-stage")).toHaveAttribute("data-mode", "diagram");
  await expect(a.getByTestId("static-pipeline")).toBeVisible();
  await expect(a.locator(".engine-stations a")).toHaveCount(5);
  await a.close();
  const b = await browser.newPage({ viewport: DESKTOP, reducedMotion: "reduce" });
  await b.goto("/");
  await expect(b.getByTestId("engine-stage")).toHaveAttribute("data-mode", "poster");
  await expect(b.locator("canvas")).toHaveCount(0);
  await expect(b.locator("video")).toHaveCount(0);
  await expect(b.locator(".process")).toHaveAttribute("data-wipe", "false");
  await b.close();
});

test("gate 7 stations are reachable by keyboard and stay visible while focused", async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await openLive(page, "/?t=11.9"); // the empty hold, when every label is faded out
  const first = page.locator(".engine-stations li").first();
  await expect.poll(() => first.evaluate((e) => getComputedStyle(e).opacity)).toBe("0");
  await first.locator("a").focus();
  await expect(first).toHaveCSS("opacity", "1");
});

test("the earlier concept page is still there, linked from the footer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Earlier concept work" }).click();
  await expect(page).toHaveURL(/\/voltaedge$/);
});
