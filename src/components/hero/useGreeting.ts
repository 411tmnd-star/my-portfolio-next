"use client";

import { useEffect, type RefObject } from "react";

/**
 * The greeting state machine from the live site, unchanged in behaviour:
 *
 *   idle ─► notice ─► lit ─► HELLO ─► 411 ─► revealed ─► tracking
 *
 * Triggered by the first pointermove / scroll / touchstart / keydown, or on
 * its own after 1.4s. Reduced motion skips straight to a lit visor reading
 * "411" with all copy visible. A 6s safety net always reveals the copy.
 *
 * Kept renderer-agnostic on purpose: step 3 swaps the SVG for the 3D
 * humanoid and drives its pose clips from the same phases.
 */
export function useGreeting(heroRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const head = hero.querySelector<SVGGElement>("#robotHead");
    const eyes = hero.querySelector<SVGGElement>("#robotEyes");
    const greet = hero.querySelector<SVGTextElement>("#robotGreet");
    const svg = hero.querySelector<SVGSVGElement>("svg");
    if (!head || !eyes || !greet || !svg) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    if (reduced) {
      greet.textContent = "411";
      greet.style.transition = "none";
      greet.classList.add("show");
      eyes.style.opacity = "0";
      return;
    }

    const timers: number[] = [];
    const after = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    let raf: number | null = null;
    let blinker: number | null = null;
    let activated = false;

    hero.classList.add("intro");
    head.style.transform = "translate(9px,3px) rotate(0.5deg)";

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const applyHead = (x: number, y: number) => {
      head.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${(x * 0.055).toFixed(3)}deg)`;
      eyes.style.transform = `translate(${(x * 0.26).toFixed(2)}px,${(y * 0.22).toFixed(2)}px)`;
    };
    const loop = () => {
      current.x += (target.x - current.x) * 0.085;
      current.y += (target.y - current.y) * 0.085;
      applyHead(current.x, current.y);
      raf =
        Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05
          ? requestAnimationFrame(loop)
          : null;
    };
    const kick = () => {
      if (raf === null) raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      if (!activated || !fine) return;
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.38;
      target.x = Math.max(-16, Math.min(16, ((e.clientX - cx) / (window.innerWidth / 2)) * 16));
      target.y = Math.max(-9, Math.min(9, ((e.clientY - cy) / (window.innerHeight / 2)) * 9));
      kick();
    };

    const startBlink = () => {
      if (blinker) return;
      blinker = window.setInterval(() => {
        if (document.hidden) return;
        const els = eyes.querySelectorAll(".robot-eye");
        els.forEach((el) => el.classList.add("blink"));
        window.setTimeout(() => els.forEach((el) => el.classList.remove("blink")), 110);
      }, 5200);
    };
    const stopBlink = () => {
      if (blinker) {
        clearInterval(blinker);
        blinker = null;
      }
    };

    const activate = () => {
      if (activated) return;
      activated = true;
      head.style.transform = "translate(0,0) rotate(0deg)";
      after(420, () => hero.classList.add("lit"));
      after(1150, () => {
        hero.classList.add("greeting");
        greet.classList.add("show");
      });
      after(2350, () => {
        greet.classList.remove("show");
        after(300, () => {
          greet.textContent = "411";
          greet.classList.add("show");
        });
      });
      after(3400, () => {
        greet.classList.remove("show");
        hero.classList.remove("greeting");
        hero.classList.add("revealed");
      });
      after(4200, () => {
        hero.classList.add("tracking");
        startBlink();
      });
    };

    const triggers = ["pointermove", "scroll", "touchstart", "keydown"] as const;
    triggers.forEach((evt) => window.addEventListener(evt, activate, { once: true, passive: true }));
    after(1400, activate);
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        stopBlink();
      } else if (activated) {
        startBlink();
        kick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    after(6000, () => hero.classList.add("revealed"));

    return () => {
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
      stopBlink();
      triggers.forEach((evt) => window.removeEventListener(evt, activate));
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [heroRef]);
}
