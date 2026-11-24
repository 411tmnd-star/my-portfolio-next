import { HUB_SCALE, VIEW_HEIGHT } from "@/components/engine/layout";
import { HANDOFF_START } from "./DockProgress";

export const HERO_CAMERA = { z: 2.9, fov: 45 } as const;
/** World height the hero camera sees at the mark's plane. */
export const HERO_VIEW = 2 * HERO_CAMERA.z * Math.tan((HERO_CAMERA.fov * Math.PI) / 360);

export type Rect = { left: number; top: number; width: number; height: number };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function progressOf(scrollY: number, heroHeight: number): number {
  return heroHeight > 0 ? clamp01(scrollY / heroHeight) : 0;
}

export function handoffOf(progress: number): number {
  return clamp01((progress - HANDOFF_START) / (1 - HANDOFF_START));
}

/** Slow start, slow finish: the mark leaves gently and settles. */
export const travel = (p: number) => p * p * (3 - 2 * p);

/**
 * Transform of the mark's box at a given progress. Both rectangles are in page coordinates, measured once
 * and again on resize, so a scroll frame reads no layout.
 */
export function dockTransform(zone: Rect, hub: Rect, frameHeight: number, progress: number) {
  const k = travel(progress);
  const dx = hub.left + hub.width / 2 - (zone.left + zone.width / 2);
  const dy = hub.top + hub.height / 2 - (zone.top + zone.height / 2);
  const end = frameHeight > 0 ? (HUB_SCALE * frameHeight) / VIEW_HEIGHT / (zone.height / HERO_VIEW) : 1;
  return { x: dx * k, y: dy * k, scale: 1 + (end - 1) * k };
}
