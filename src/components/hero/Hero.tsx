"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO } from "@/content/site";
import { HERO_VIEW, dockTransform, handoffOf, posterFade, progressOf, type Rect } from "./dockMath";
import { useAfterPaint, useDock } from "./DockProgress";
import { FlatMark } from "./SegmentDigitFlat";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const pageRect = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height };
};

/**
 * Compact hero: the mark, the name and two links, with the top of the stage already in view beneath.
 * Nothing is pinned. progress = scrollY / heroHeight, and the mark rides down to the hub on the stage.
 */
export default function Hero() {
  const { progressRef, handoffRef, hubPresenceRef, markHostRef, wakeRef, badgeHostRef, stageRef, hubRef, mode, reduced } = useDock();
  const heroRef = useRef<HTMLElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const after = useAfterPaint(mode === "live");
  const [drawn, setDrawn] = useState(false);
  const onReady = useCallback(() => setDrawn(true), []);

  useEffect(() => {
    const hero = heroRef.current;
    const zone = zoneRef.current;
    const host = markHostRef.current;
    const stage = stageRef.current;
    const hub = hubRef.current;
    if (!hero || !zone || !host || !stage || !hub) return;

    let heroHeight = 1;
    let stageBottom = Infinity;
    let frameHeight = 0;
    let from: Rect | null = null;
    let to: Rect | null = null;
    let raf = 0;

    const draw = () => {
      raf = 0;
      const progress = progressOf(window.scrollY, heroHeight);
      const handoff = handoffOf(progress);
      progressRef.current = progress;
      handoffRef.current = handoff;
      if (!reduced && from && to) {
        const t = dockTransform(from, to, frameHeight, progress);
        host.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale})`;
        host.style.opacity = String(mode === "poster" ? posterFade(progress) : 1 - handoff * (hubPresenceRef.current ?? 1));
      }
      wakeRef.current?.();
      const badge = badgeHostRef.current;
      if (badge) badge.style.opacity = window.scrollY > stageBottom ? "1" : "0";
    };
    const measure = () => {
      heroHeight = hero.offsetHeight;
      const s = pageRect(stage);
      stageBottom = s.top + s.height;
      frameHeight = hub.parentElement?.clientHeight ?? 0;
      from = pageRect(zone);
      to = pageRect(hub);
      draw();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(measure);
    for (const el of [hero, zone, stage, hub]) observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [badgeHostRef, handoffRef, hubPresenceRef, hubRef, markHostRef, mode, progressRef, reduced, stageRef, wakeRef]);

  return (
    <section id="top" ref={heroRef} data-testid="hero" className="hero">
      <div ref={zoneRef} className="hero-zone">
        <div ref={markHostRef} className="hero-mark" data-testid="hero-mark" aria-hidden="true">
          <div className="hero-mark-flat" style={{ height: `${100 / HERO_VIEW}%`, opacity: drawn ? 0 : 1 }}>
            <FlatMark />
          </div>
          {after && <HeroCanvas onReady={onReady} />}
          <div
            data-testid="mark-box"
            className="mark-box"
            style={{ height: `${100 / HERO_VIEW}%` }}
          />
        </div>
      </div>
      <div className="hero-copy">
        <h1>
          <span className="hero-name">{HERO.name}</span>{" "}
          <span className="hero-role">{HERO.role}</span>
        </h1>
        <div className="hero-actions">
          {HERO.actions.map((a, i) => (
            <a key={a.href} href={a.href} className={`btn ${i === 0 ? "btn-primary" : "btn-ghost"}`} target="_blank" rel="noopener">
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
