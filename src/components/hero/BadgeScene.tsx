"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import type { Group } from "three";
import { MarkSlot } from "@/components/mark/MarkSlot";
import { swing } from "@/components/mark/swing";

const IDLE_SWING_SPEED = 0.4; // phase per second once docked
const HOVER_SWING_SPEED = 0.13; // slower on hover, not stopped

export function BadgeScene({ hoverRef, progressRef, accent, reduced }: {
  hoverRef: RefObject<boolean>;
  progressRef: RefObject<number>;
  accent: string;
  reduced: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const phase = useRef(0);
  useFrame((_, delta) => {
    phase.current += (hoverRef.current ? HOVER_SWING_SPEED : IDLE_SWING_SPEED) * Math.min(delta, 0.1);
    if (groupRef.current) groupRef.current.rotation.y = swing(phase.current);
  });
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 3]} intensity={1.2} />
      <group ref={groupRef}>
        <MarkSlot progressRef={progressRef} accent={accent} reduced={reduced} />
      </group>
    </>
  );
}
