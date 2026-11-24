/**
 * Captures every still and the loop from the real-time scene, in software WebGL (no GPU).
 *
 *   npm run build && npm start -- -p 4173
 *   node scripts/capture.mjs [stills] [loop] [rig] [og]      (default: all)
 *
 * Needs ffmpeg on the PATH.
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:4173";
const OUT = path.resolve("public/media");
const want = new Set(process.argv.slice(2).length ? process.argv.slice(2) : ["stills", "loop", "rig", "og"]);
const GROUND = "#0B0E12";
const FPS = 24;
const SECONDS = 12;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "engine-"));
const ffmpeg = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const save = (file, dataUrl) => fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
const webp = (png, name, quality = 84) => {
  ffmpeg("-i", png, "-c:v", "libwebp", "-quality", String(quality), path.join(OUT, name));
  console.log(name, fs.statSync(path.join(OUT, name)).size);
};

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const open = async (query) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => console.log("pageerror", e.message));
  await page.goto(`${BASE}/${query}`);
  await page.waitForFunction(() => window.__engine?.ready(), null, { timeout: 180_000 });
  return page;
};

if (want.has("stills")) {
  for (const pass of ["wire", "clay", "final"]) {
    const page = await open(`?t=6&pass=${pass}`); // the same address a person can open
    const png = path.join(tmp, `${pass}.png`);
    save(png, await page.evaluate(([p, g]) => window.__engine.png(1600, 1000, 6, p, g), [pass, GROUND]));
    webp(png, `process-${pass}.webp`, 88);
    if (pass === "final") {
      save(png, await page.evaluate(() => window.__engine.png(1280, 800, 6, "final")));
      webp(png, "engine-poster.webp");
      await page.evaluate(() => window.__engine.hub(0));
      save(png, await page.evaluate(() => window.__engine.png(1280, 800, 2, "final")));
      webp(png, "engine-idle.webp");
    }
    await page.close();
  }
}

if (want.has("loop")) {
  const page = await open("?t=0");
  for (let i = 0; i < SECONDS * FPS; i++) {
    save(path.join(tmp, `f${String(i).padStart(4, "0")}.png`), await page.evaluate(([t, g]) => window.__engine.png(960, 600, t, "final", g), [i / FPS, GROUND]));
  }
  await page.close();
  const input = ["-framerate", String(FPS), "-i", path.join(tmp, "f%04d.png"), "-an", "-pix_fmt", "yuv420p"];
  ffmpeg(...input, "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-movflags", "+faststart", path.join(OUT, "engine-loop.mp4"));
  ffmpeg(...input, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1", path.join(OUT, "engine-loop.webm"));
  for (const f of ["engine-loop.mp4", "engine-loop.webm"]) console.log(f, fs.statSync(path.join(OUT, f)).size);
}

if (want.has("rig")) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE);
  const frame = page.locator("#project-maximus-character-rig .project-frame");
  await frame.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("#project-maximus-character-rig img")?.style.opacity === "0", null, { timeout: 120_000 });
  await page.waitForTimeout(800);
  const url = await page.evaluate(() => document.querySelector("#project-maximus-character-rig canvas").toDataURL("image/png"));
  save(path.join(tmp, "rig.png"), url);
  ffmpeg("-i", path.join(tmp, "rig.png"), "-vf", "scale=960:-2", "-c:v", "libwebp", "-quality", "86", path.join(OUT, "rig.webp"));
  console.log("rig.webp", fs.statSync(path.join(OUT, "rig.webp")).size);
  await page.close();
}

if (want.has("og")) {
  const poster = fs.readFileSync(path.join(OUT, "engine-poster.webp")).toString("base64");
  const font = fs.readFileSync("src/app/fonts/SpaceGrotesk-latin-wght.woff2").toString("base64");
  const card = (title, sub, tag, image) => `<!doctype html><style>
    @font-face{font-family:SG;src:url(data:font/woff2;base64,${font});font-weight:300 700}
    body{margin:0;width:1200px;height:630px;background:#0B0E12;color:#E6EDF3;font-family:SG;position:relative;overflow:hidden}
    body::before{content:"";position:absolute;inset:0;background:linear-gradient(rgb(230 237 243/.05) 1px,transparent 1px) 0 0/64px 64px,linear-gradient(90deg,rgb(230 237 243/.05) 1px,transparent 1px) 0 0/64px 64px}
    img{position:absolute;right:-62px;top:78px;height:474px}
    .t{position:absolute;left:64px;top:${image ? 190 : 220}px;width:${image ? 440 : 900}px}
    h1{margin:0;font-size:${image ? 62 : 84}px;line-height:1.04;letter-spacing:-.02em}
    p{margin:18px 0 0;font-size:${image ? 28 : 30}px;line-height:1.3;color:#A3AEBA}
    b{position:absolute;left:64px;top:60px;font-size:34px;color:#E08030}
    </style><b>${tag}</b>${image ? `<img src="data:image/webp;base64,${poster}">` : ""}<div class=t><h1>${title}</h1><p>${sub}</p></div>`;
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [file, html] of [
    ["og-card.png", card("Michael Ikhine", "Python, 3D Technical Art &amp; Graphics Pipeline Engineer", "411", true)],
    ["og-voltaedge.png", card("VoltaEdge AI", "Earlier concept work by Michael Ikhine", "411", false)],
  ]) {
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.resolve("public", file) });
    console.log(file, fs.statSync(path.resolve("public", file)).size);
  }
  await page.close();
}

await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
