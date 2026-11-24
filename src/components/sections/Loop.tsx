"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { HUB, HUB_SCALE, project, STATION_SLOTS, VIEW_HEIGHT, FRAME_ASPECT } from "@/components/engine/layout";
import { StaticPipeline } from "@/components/engine/StaticPipeline";
import { useAfterPaint, useDock } from "@/components/hero/DockProgress";
import { READY_PROJECTS } from "@/content/projects";
import { ENGINE } from "@/content/site";

const EngineCanvas = dynamic(() => import("@/components/engine/EngineCanvas"), { ssr: false });

const pct = (v: number) => `${(v * 100).toFixed(3)}%`;

/** Stations in path order, with the slot that says where they stand. */
const STATIONS = STATION_SLOTS.flatMap((slot, index) => {
  const p = READY_PROJECTS.find((x) => x.station === slot.id);
  return p ? [{ slot, index, p, at: project([slot.at.x, slot.labelY, slot.at.z]) }] : [];
});

const hubAt = project(HUB);
/** The mark seen isometrically: 2.1 wide at 45 degrees, its height foreshortened and sheared. */
const HUB_BOX: CSSProperties = {
  left: pct(hubAt.left),
  top: pct(hubAt.top),
  width: pct((2.1 * HUB_SCALE * Math.SQRT1_2) / (VIEW_HEIGHT * FRAME_ASPECT)),
  height: pct((HUB_SCALE * (2.1 / Math.sqrt(6) + 2 / Math.sqrt(6))) / VIEW_HEIGHT),
};

/**
 * The Live engine stage. Desktop with WebGL2 gets the real-time scene, phones and reduced motion get a
 * poster (and a captured loop where motion is allowed), no WebGL2 gets the diagram. The station links are
 * the same list in every case, and without JavaScript they are simply a list.
 */
export default function Loop() {
  const { stageRef, hubRef, mode, reduced } = useDock();
  const frameRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [near, setNear] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const idle = useAfterPaint(mode === "live");

  useEffect(() => {
    if (!frameRef.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px" });
    io.observe(frameRef.current);
    return () => io.disconnect();
  }, []);

  const onFirstFrame = useCallback(() => setDrawn(true), []);
  const labels = useCallback((opacity: number[], lit: number[]) => {
    const items = listRef.current?.children;
    if (!items) return;
    STATIONS.forEach(({ index }, i) => {
      const el = items[i] as HTMLElement | undefined;
      if (!el) return;
      el.style.setProperty("--shown", opacity[index].toFixed(3));
      el.dataset.lit = lit[index] > 0.5 ? "true" : "false";
    });
  }, []);

  const live = mode === "live" && near && idle;
  return (
    <section id="engine" ref={stageRef} data-testid="engine-stage" data-mode={mode} data-drawn={drawn} className="engine">
      <div className="engine-head">
        <div>
          <span className="section-label">{ENGINE.eyebrow}</span>
          <h2 className="section-title">{ENGINE.title}</h2>
        </div>
        <ol className="engine-captions" aria-label="What the loop shows">
          {ENGINE.captions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </div>

      <div className="engine-body">
      <div ref={frameRef} className="engine-frame">
        {mode === "diagram" ? (
          <StaticPipeline />
        ) : (
          <picture>
            <source media="(max-width: 899.9px), (prefers-reduced-motion: reduce)" srcSet="/media/engine-poster.webp" />
            <img
              className="engine-poster"
              src="/media/engine-idle.webp"
              width={1280}
              height={800}
              alt="Isometric board with the 411 core and five project stations along an amber trace"
              fetchPriority="low"
            />
          </picture>
        )}
        {mode === "poster" && !reduced && near && (
          <video className="engine-poster" autoPlay muted loop playsInline preload="none" poster="/media/engine-poster.webp" aria-hidden="true">
            <source src="/media/engine-loop.webm" type="video/webm" />
            <source src="/media/engine-loop.mp4" type="video/mp4" />
          </video>
        )}
        {live && <EngineCanvas onFirstFrame={onFirstFrame} labels={labels} />}
        <div ref={hubRef} className="engine-hub" style={HUB_BOX} data-testid="hub" aria-hidden="true" />
      </div>

      <ol ref={listRef} className="engine-stations" aria-label="Stations, in the order the robot passes them">
        {STATIONS.map(({ slot, p, at }) => (
          <li key={p.id} data-side={slot.side} style={{ "--x": pct(at.left), "--y": pct(at.top) } as CSSProperties}>
            <a href={p.repo} target="_blank" rel="noopener">
              <span className="station-name">{p.title}</span>
              <span className="station-line">{p.cardLine}</span>
              <span className="station-status">{p.status}</span>
            </a>
          </li>
        ))}
      </ol>
      </div>
      <noscript>
        <p className="engine-noscript">The moving scene needs JavaScript. The stations above are its content.</p>
      </noscript>
    </section>
  );
}
