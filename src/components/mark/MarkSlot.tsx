"use client";

import { lazy, type RefObject } from "react";
import { createMarkSlot } from "./createMarkSlot";
import { SegmentMark } from "./SegmentMark";

/**
 * The 411 mark, behind one slot. Change ACTIVE_MARK and the hero, the hub on the stage and the corner
 * badge all change with it.
 *
 * Contract for any mark: centred on the origin, Y up, front on +Z, fits 2.1 x 1.0 x 0.3 units,
 * no lights or camera of its own.
 */
export type MarkProps = { progressRef: RefObject<number>; accent: string; reduced: boolean };

export const MARKS = { segment: SegmentMark, board: lazy(() => import("./BoardMark")) };
export const ACTIVE_MARK: keyof typeof MARKS = "segment";

export const MarkSlot = createMarkSlot(MARKS, ACTIVE_MARK);
