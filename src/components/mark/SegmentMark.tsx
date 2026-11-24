"use client";

import { SegmentDigit3D } from "@/components/hero/SegmentDigit3D";
import { DIGIT_CELL_WIDTH, MARK_DIGITS, MARK_FIT } from "@/lib/sevenSegment";
import type { MarkProps } from "./MarkSlot";

/** The working 411: three seven-segment digits. */
export function SegmentMark({ accent }: MarkProps) {
  const startX = (-MARK_DIGITS.length * DIGIT_CELL_WIDTH) / 2 + DIGIT_CELL_WIDTH / 2;
  return (
    <group scale={MARK_FIT}>
      {MARK_DIGITS.map(({ id, value }, i) => (
        <SegmentDigit3D key={id} digit={value} position={[startX + i * DIGIT_CELL_WIDTH, 0, 0]} activeColor={accent} />
      ))}
    </group>
  );
}
