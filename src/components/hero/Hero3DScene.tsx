"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import type { Group, PerspectiveCamera } from "three";
import { ISO_TILT, ISO_YAW } from "@/components/engine/layout";
import { MarkSlot } from "@/components/mark/MarkSlot";
import { swing } from "@/components/mark/swing";
import { HERO_CAMERA, HERO_VIEW } from "./dockMath";

const SWING_SPEED = 1; // phase per second at the very top of the page: one full swing in 6.3 s

/** 0 until the dock begins to bite, 1 when the mark has taken the stage's angle. */
export function settle(progress: number): number {
  const v = Math.min(1, Math.max(0, (progress - 0.35) / 0.5));
  return v * v * (3 - 2 * v);
}

/**
 * The travelling mark. Swings at the top of the page, always readable, slows as the visitor scrolls, and turns to the stage's
 * isometric angle on the way. Reads progress from a ref each frame, so scrolling never re-renders React.
 */
export function Hero3DScene({ progressRef, accent, reduced }: { progressRef: RefObject<number>; accent: string; reduced: boolean }) {
  const outer = useRef<Group>(null);
  const phase = useRef(0);

  useFrame(({ camera }, delta) => {
    const group = outer.current;
    if (!group) return;
    const progress = progressRef.current ?? 0;
    if (!reduced) phase.current += Math.min(delta, 0.1) * SWING_SPEED * (1 - progress);
    const k = settle(progress);
    group.rotation.x = ISO_TILT * k;
    const yaw = swing(phase.current);
    group.rotation.y = yaw + (ISO_YAW - yaw) * k;
    // Pull back and narrow the lens together: the mark keeps its size and loses its perspective, so it
    // arrives looking the way the stage's parallel camera sees it.
    const lens = camera as PerspectiveCamera;
    const z = HERO_CAMERA.z * (1 + 14 * k);
    if (lens.isPerspectiveCamera && Math.abs(lens.position.z - z) > 1e-4) {
      lens.position.z = z;
      lens.fov = (2 * Math.atan(HERO_VIEW / 2 / z) * 180) / Math.PI;
      lens.updateProjectionMatrix();
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />
      <group ref={outer}>
        <MarkSlot progressRef={progressRef} accent={accent} reduced={reduced} />
      </group>
    </>
  );
}
