"use client";

import { RoundedBox } from "@react-three/drei";
import { ALL_SEGMENTS, SEGMENT_LAYOUT, segmentsFor } from "@/lib/sevenSegment";

const DEPTH = 0.16;
const RADIUS = 0.02;
const IDLE_COLOR = "#3a3e45";

/** One seven-segment digit, built from rounded boxes. No font asset needed. */
export function SegmentDigit3D({
  digit,
  position = [0, 0, 0],
  activeColor,
}: {
  digit: string;
  position?: [number, number, number];
  activeColor: string;
}) {
  const active = new Set(segmentsFor(digit));

  return (
    <group position={position}>
      {ALL_SEGMENTS.map((id) => {
        const layout = SEGMENT_LAYOUT[id];
        const isOn = active.has(id);
        const args: [number, number, number] = layout.vertical
          ? [layout.thickness, layout.length, DEPTH]
          : [layout.length, layout.thickness, DEPTH];
        return (
          <RoundedBox key={id} args={args} radius={RADIUS} smoothness={2} position={[layout.x, layout.y, 0]}>
            <meshStandardMaterial
              color={isOn ? activeColor : IDLE_COLOR}
              emissive={isOn ? activeColor : "#000000"}
              emissiveIntensity={isOn ? 0.55 : 0}
              roughness={0.35}
              metalness={0.1}
              transparent
              opacity={isOn ? 1 : 0.35}
            />
          </RoundedBox>
        );
      })}
    </group>
  );
}
