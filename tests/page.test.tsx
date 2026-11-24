import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VIEW_HEIGHT, HUB_SCALE } from "@/components/engine/layout";
import { StaticPipeline } from "@/components/engine/StaticPipeline";
import { DockedMarkBadge } from "@/components/hero/DockedMarkBadge";
import { dockTransform, handoffOf, HERO_VIEW, progressOf, travel } from "@/components/hero/dockMath";
import { DockProgressProvider } from "@/components/hero/DockProgress";
import Hero from "@/components/hero/Hero";
import { FlatMark } from "@/components/hero/SegmentDigitFlat";
import Loop from "@/components/sections/Loop";
import Projects from "@/components/sections/Projects";
import { assertProjects, PROJECTS, READY_PROJECTS, SIGNAL_PIPELINE } from "@/content/projects";
import { HERO, HOW, CONTACT, ENGINE, PROCESS, SITE } from "@/content/site";
import { setMedia } from "./setup";

const inDock = (node: React.ReactNode) => render(<DockProgressProvider>{node}</DockProgressProvider>);

// ------------------------------------------------------------------ ported from the 21 September build
describe("hero (was ScrollHero)", () => {
  it("puts the name and the role in one h1 and falls back to the flat mark without WebGL2", () => {
    inDock(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Michael Ikhine Python, 3D Technical Art & Graphics Pipeline Engineer");
    expect(h1).toBeVisible();
    expect(screen.getByTestId("flat-mark")).toBeInTheDocument();
    expect(document.querySelector("canvas")).not.toBeInTheDocument();
  });
  it("has exactly the two locked links", () => {
    inDock(<Hero />);
    expect(screen.getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["GitHub", "https://github.com/411tmnd-star"],
      ["Live 3D Studio", "https://better-style-shop.vercel.app/catalogue/#/fitting"],
    ]);
  });
});

describe("docked badge", () => {
  it("renders nothing without WebGL2, which is the real fallback path in jsdom", () => {
    inDock(<DockedMarkBadge />);
    expect(screen.queryByTestId("docked-mark-badge")).not.toBeInTheDocument();
    expect(document.querySelector("canvas")).not.toBeInTheDocument();
  });
});

describe("static pipeline (was CommandCenterPipeline)", () => {
  it("names every ready project and has no canvas or flow library", () => {
    const { container } = render(<StaticPipeline />);
    for (const p of READY_PROJECTS) expect(screen.getByText(p.title)).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector(".react-flow")).not.toBeInTheDocument();
  });
});

describe("flat mark", () => {
  it("lights eight segments: 4 + 2 + 2", () => {
    const { container } = render(<FlatMark />);
    expect(container.querySelectorAll('[data-segment="on"]')).toHaveLength(8);
    expect(container.querySelectorAll('[data-segment="off"]')).toHaveLength(13);
  });
});

// ------------------------------------------------------------------ stage
describe("live engine", () => {
  it("shows the diagram when WebGL2 is missing", () => {
    setMedia(["(min-width: 900px)"]);
    inDock(<Loop />);
    expect(screen.getByRole("heading", { level: 2, name: "Live engine" })).toBeVisible();
    expect(screen.getByTestId("static-pipeline")).toBeInTheDocument();
    expect(screen.getByTestId("engine-stage")).toHaveAttribute("data-mode", "diagram");
  });
  it.each([["phone", [] as string[]], ["reduced motion", ["(min-width: 900px)", "(prefers-reduced-motion: reduce)"]]])("shows the poster on %s", (_, media) => {
    setMedia(media);
    inDock(<Loop />);
    expect(screen.getByTestId("engine-stage")).toHaveAttribute("data-mode", "poster");
    expect(document.querySelector("img.engine-poster")).toBeInTheDocument();
    expect(document.querySelector("video")).not.toBeInTheDocument(); // only near the stage, and never with reduced motion
    setMedia();
  });
  it("lists the stations as links with a label and a status, in path order", () => {
    inDock(<Loop />);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.querySelector(".station-name")?.textContent)).toEqual([
      "maximus-character-rig", "maximus-garment-physics", "better-style-asset-pipeline", "audio-lab", "Humanoid-Robot",
    ]);
    for (const l of links) expect(l.querySelector(".station-status")?.textContent).toMatch(/^Public/);
  });
});

// ------------------------------------------------------------------ content
describe("content", () => {
  it("gives every number a proof link", () => {
    render(<DockProgressProvider><Projects /></DockProgressProvider>);
    const links = [...document.querySelectorAll("a[data-metric]")];
    expect(links).toHaveLength(READY_PROJECTS.length * 3);
    for (const a of links) expect(a.getAttribute("href")).toMatch(/^https:\/\//);
  });
  it("refuses to load when a proof link is missing", () => {
    const broken = structuredClone(PROJECTS);
    broken[0].metrics[1].proofUrl = "";
    expect(() => assertProjects(broken)).toThrow(/no proofUrl/);
    const short = structuredClone(PROJECTS);
    (short[0].metrics as unknown[]).pop();
    expect(() => assertProjects(short)).toThrow(/three numbers/);
    expect(() => assertProjects(PROJECTS)).not.toThrow();
  });
  it("keeps the signal pipeline hidden while it has no public address", () => {
    expect(SIGNAL_PIPELINE.ready).toBe(false);
    expect(READY_PROJECTS.map((p) => p.id)).not.toContain(SIGNAL_PIPELINE.id);
  });
  it("uses the locked card lines", () => {
    expect(Object.fromEntries(PROJECTS.map((p) => [p.id, p.cardLine]))).toEqual({
      "maximus-character-rig": "16 poses, 201 collapsed triangles to 0",
      "maximus-garment-physics": "Ringer tee p99 1.076, 0 vertices inside",
      "better-style-asset-pipeline": "Candidate, approve, publish, rollback",
      "audio-lab": "341 tests passed, 47 skipped",
      "humanoid-robot": "184 bones, 93 tests",
    });
  });
  it("says none of the things that may not be said", () => {
    const all = JSON.stringify([PROJECTS, HERO, HOW, CONTACT, ENGINE, PROCESS, SITE]);
    for (const banned of [/lighthouse/i, /\bfps\b|frames per second/i, /reduced[- ]poly/i, /\bARAP\b/i, /multi-layer cloth works/i, /₦|naira/i, /wa\.me|whatsapp/i, /\+?234\d{6}/, /opinion of client/i]) {
      expect(all).not.toMatch(banned);
    }
  });
});

// ------------------------------------------------------------------ dock maths
describe("dock maths", () => {
  const zone = { left: 290, top: 72, width: 860, height: 417 };
  const hub = { left: 709, top: 700, width: 131, height: 147 };
  it("is progress over one hero height, clamped", () => {
    expect([progressOf(0, 675), progressOf(337.5, 675), progressOf(675, 675), progressOf(9999, 675), progressOf(5, 0)]).toEqual([0, 0.5, 1, 1, 0]);
  });
  it("hands over from 0.85", () => {
    expect([handoffOf(0), handoffOf(0.85), handoffOf(1)]).toEqual([0, 0, 1]);
    expect(handoffOf(0.925)).toBeCloseTo(0.5);
  });
  it("starts in place and ends on the hub at the hub's size", () => {
    expect(dockTransform(zone, hub, 760, 0)).toEqual({ x: 0, y: 0, scale: 1 });
    const end = dockTransform(zone, hub, 760, 1);
    expect(zone.left + zone.width / 2 + end.x).toBeCloseTo(hub.left + hub.width / 2);
    expect(zone.top + zone.height / 2 + end.y).toBeCloseTo(hub.top + hub.height / 2);
    expect((zone.height / HERO_VIEW) * end.scale).toBeCloseTo((HUB_SCALE * 760) / VIEW_HEIGHT);
  });
  it("only ever moves forward", () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.01) {
      expect(travel(p)).toBeGreaterThanOrEqual(last);
      last = travel(p);
    }
  });
});
