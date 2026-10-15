"use client";

import { useEffect, useRef } from "react";

/**
 * §5 Process — wireframe → clay → final, as a scroll-driven wipe.
 *
 * Reference-board decision (§G): NOT a 148-frame image sequence (the
 * canonical Apple technique costs ~56MB / 30s+ load). Because all three
 * passes share one locked camera and one frame (§1), two stacked images with
 * a clip-path wipe give the identical effect for two files. Swap the two
 * placeholder panels below for the real clay and final renders — same
 * camera, same frame, or the wipe won't register.
 *
 * GSAP + ScrollTrigger is free (incl. all plugins) as of the reference
 * board's research — see claude/411-reference-board.md §G.
 */
export default function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;

    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current || !topLayerRef.current) return;

      ctx = gsap.context(() => {
        gsap.set(topLayerRef.current, { clipPath: "inset(0 0% 0 0)" });
        gsap.to(topLayerRef.current, {
          clipPath: "inset(0 100% 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=1000",
            scrub: 1,
            pin: true,
          },
        });
      }, containerRef);
    })();

    return () => ctx?.revert();
  }, []);

  return (
    <section id="process" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-2xl font-semibold text-[var(--color-silkscreen)]">Process</h2>
      <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
        Wireframe → clay → final, from one locked camera.
      </p>

      <div ref={containerRef} className="relative mt-10 aspect-video w-full overflow-hidden rounded-2xl">
        {/* bottom layer: final render */}
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-copper)]/20 font-mono-brand text-sm text-[var(--color-muted)]">
          FINAL — replace with final render
        </div>
        {/* top layer: wireframe/clay, wiped away left→right on scroll */}
        <div
          ref={topLayerRef}
          className="absolute inset-0 flex items-center justify-center bg-[var(--color-substrate)] font-mono-brand text-sm text-[var(--color-muted)]"
        >
          WIREFRAME / CLAY — replace with clay render
        </div>
      </div>
    </section>
  );
}
