"use client";

import { type ComponentType, Suspense } from "react";
import type { MarkProps } from "./MarkSlot";

/** Turns a table of marks and the active key into the one component that hero, hub and badge render. */
export function createMarkSlot<K extends string>(marks: Record<K, ComponentType<MarkProps>>, active: K) {
  const Active: ComponentType<MarkProps> = marks[active];
  return function MarkSlot(props: MarkProps) {
    return (
      <group name="mark-slot">
        <Suspense fallback={null}>
          <Active {...props} />
        </Suspense>
      </group>
    );
  };
}
