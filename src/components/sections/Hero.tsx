"use client";

import { useState } from "react";

/**
 * §1 Hero — placeholder ring.
 *
 * Reference-board decision (22 Sep 2026): show 4 nodes on the ring, all 8 in
 * §3 Ecosystem. See claude/411-reference-board.md for the reasoning.
 *
 * This is a DOM/CSS stand-in for the real hero: a closed trace loop lying in
 * the isometric board plane (NOT a tilted planetary orbit — see §D of the
 * reference board), with node hover/labels in DOM over the canvas. Swap the
 * center mark + ring for a real .glb in React Three Fiber once the KiCad/
 * Blender geometry exists; keep the DOM label layer as-is — §D found no 3D
 * implementation actually labels its nodes, DOM-over-canvas is the pattern.
 */

const NODES = [
  { id: "aos", label: "411 AOS", sub: "agentic OS", angle: -90 },
  { id: "market", label: "411 Market", sub: "voice storefront", angle: 0 },
  { id: "live", label: "411 Live", sub: "real-time voice/video", angle: 90 },
  { id: "energy", label: "Smart Energy", sub: "VoltaEdge · IoT", angle: 180 },
];

const RADIUS = 170;

export default function Hero() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="top" className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div className="relative flex h-[420px] w-[420px] items-center justify-center">
        {/* closed trace loop */}
        <div
          className="absolute inset-0 rounded-full border border-[var(--color-copper)]/40"
          style={{ boxShadow: "0 0 40px -10px var(--color-copper)" }}
        />

        {/* center 411 mark */}
        <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-2xl border border-[var(--color-copper)] bg-[var(--color-panel)] font-mono-brand text-2xl tracking-widest text-[var(--color-silkscreen)]">
          411
        </div>

        {/* nodes */}
        {NODES.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = Math.cos(rad) * RADIUS;
          const y = Math.sin(rad) * RADIUS;
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all"
              data-state={isActive ? "active" : "idle"}
            >
              <span
                className="absolute h-3 w-3 rounded-full transition-colors"
                style={{
                  background: isActive ? "var(--color-cyan)" : "var(--color-copper-highlight)",
                  boxShadow: isActive ? "0 0 12px var(--color-cyan)" : "none",
                }}
              />
              {isActive && (
                <span className="absolute top-8 whitespace-nowrap rounded-md border border-white/10 bg-[var(--color-panel)] px-3 py-1 font-mono-brand text-xs text-[var(--color-silkscreen)]">
                  {n.label}
                  <span className="ml-2 text-[var(--color-muted)]">{n.sub}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-12 max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-silkscreen)] sm:text-5xl">
          411
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">
          An ecosystem of AI, web, embedded and IoT products, engineered from
          the ground up — one circuit board at a time.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="#proof" className="rounded-full bg-[var(--color-silkscreen)] px-5 py-2.5 text-sm font-medium text-[var(--color-ground)]">
            View work
          </a>
          <a href="#ecosystem" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-[var(--color-silkscreen)]">
            Explore the ecosystem
          </a>
        </div>
      </div>
    </section>
  );
}
