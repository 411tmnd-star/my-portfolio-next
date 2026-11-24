"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import type { Group } from "three";
import { MarkSlot } from "@/components/mark/MarkSlot";

const IDLE_SPIN_SPEED = 0.25; // rad/s once docked
const HOVER_SPIN_SPEED = 0.08; // slower on hover, not stopped

export function BadgeScene({ hoverRef, progressRef, accent, reduced }: {
  hoverRef: RefObject<boolean>;
  progressRef: RefObject<number>;
  accent: string;
  reduced: boolean;
}) {
  const groupRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += (hoverRef.current ? HOVER_SPIN_SPEED : IDLE_SPIN_SPEED) * Math.min(delta, 0.1);
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
