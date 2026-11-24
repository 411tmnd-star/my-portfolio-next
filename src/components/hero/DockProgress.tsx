"use client";

import { createContext, type ReactNode, type RefObject, useContext, useEffect, useMemo, useRef, useState } from "react";

/** "live": desktop with WebGL2. "poster": phones and reduced motion. "diagram": desktop without WebGL2. */
export type StageMode = "checking" | "live" | "poster" | "diagram";

export const ACCENT = "#E08030";
export const DESKTOP_QUERY = "(min-width: 900px)";
export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
/** Progress at which the travelling mark starts to fade into the one on the stage. */
export const HANDOFF_START = 0.85;

type DockValue = {
  /** 0 at the top of the page, 1 after one hero height. Written once per scroll frame, read in refs only. */
  progressRef: RefObject<number>;
  /** 0 before HANDOFF_START, 1 when docked. */
  handoffRef: RefObject<number>;
  /** 1 while the stage's own mark can take over, 0 while the loop has it down. */
  hubPresenceRef: RefObject<number>;
  markHostRef: RefObject<HTMLDivElement | null>;
  /** Set by the stage: draws a frame. Called from the one scroll handler, so the stage can sleep otherwise. */
  wakeRef: RefObject<(() => void) | null>;
  badgeHostRef: RefObject<HTMLDivElement | null>;
  stageRef: RefObject<HTMLElement | null>;
  hubRef: RefObject<HTMLDivElement | null>;
  mode: StageMode;
  reduced: boolean;
};

const DockContext = createContext<DockValue | null>(null);

export function hasWebGL2(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/** Shared by the hero, the stage and the badge, so the capability check and the scroll maths exist once. */
export function DockProgressProvider({ children }: { children: ReactNode }) {
  const progressRef = useRef(0);
  const handoffRef = useRef(0);
  const hubPresenceRef = useRef(1);
  const markHostRef = useRef<HTMLDivElement | null>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const badgeHostRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<StageMode>("checking");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia(REDUCED_QUERY).matches;
    setReduced(isReduced);
    if (isReduced || !window.matchMedia(DESKTOP_QUERY).matches) setMode("poster");
    else setMode(hasWebGL2() ? "live" : "diagram");
  }, []);

  const value = useMemo<DockValue>(
    () => ({ progressRef, handoffRef, hubPresenceRef, markHostRef, wakeRef, badgeHostRef, stageRef, hubRef, mode, reduced }),
    [mode, reduced],
  );
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

export function useDock(): DockValue {
  const value = useContext(DockContext);
  if (!value) throw new Error("useDock must be used within a DockProgressProvider");
  return value;
}

/** Runs a callback when the browser is idle after first paint, so Three never competes with it. */
export function useAfterPaint(enabled: boolean): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let idle = 0;
    const raf = requestAnimationFrame(() => {
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(() => setReady(true), { timeout: 1200 })
        : window.setTimeout(() => setReady(true), 200);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [enabled]);
  return ready;
}
