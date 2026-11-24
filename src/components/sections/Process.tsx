"use client";

import { useEffect, useRef, useState } from "react";
import { PROCESS } from "@/content/site";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Wireframe, clay, final: three stills of one frame from one locked camera, stacked, with two clip-path
 * wipes driven by scroll. Not a frame sequence. Without JavaScript or with reduced motion the three stills
 * stand one under the other.
 */
export default function Process() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [wipe, setWipe] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setWipe(true);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!wipe || !track) return;
    let raf = 0;
    const draw = () => {
      raf = 0;
      const r = track.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const k = run > 0 ? clamp01(-r.top / run) : 0;
      track.style.setProperty("--wire", `${clamp01((k - 0.12) / 0.3) * 100}%`);
      track.style.setProperty("--clay", `${clamp01((k - 0.56) / 0.3) * 100}%`);
      track.dataset.pass = k < 0.27 ? "wire" : k < 0.71 ? "clay" : "final";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    draw();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wipe]);

  const [wire, clay, final] = PROCESS.passes;
  return (
    <section id="process" className="process" data-wipe={wipe}>
      <div className="wrap-wide process-head">
        <span className="section-label">{PROCESS.eyebrow}</span>
        <h2 className="section-title">{PROCESS.title}</h2>
        <p className="section-sub">{PROCESS.sub}</p>
      </div>
      <div ref={trackRef} className="process-track" data-pass="wire">
        <div className="process-sticky">
          <div className="process-frame" data-testid="process-frame">
            {[final, clay, wire].map((p) => (
              <figure key={p.key} className={`process-pass process-${p.key}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.alt} width={1600} height={1000} loading="lazy" decoding="async" />
                <figcaption>{p.label}</figcaption>
              </figure>
            ))}
          </div>
          <ol className="process-steps" aria-hidden="true">
            {PROCESS.passes.map((p) => (
              <li key={p.key} data-key={p.key}>{p.label}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
