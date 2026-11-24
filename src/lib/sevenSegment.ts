/**
 * Seven-segment digits for the 411 mark. Ported from the 21 September build; the 3D mark, its flat
 * fallback and the static diagram all read this one table. Segments are plain geometry, so the mark
 * needs no font file.
 *
 *   _a_
 * f|   |b
 *  |_g_|
 * e|   |c
 *  |_d_|
 */

export type SegmentId = "a" | "b" | "c" | "d" | "e" | "f" | "g";

export const ALL_SEGMENTS: SegmentId[] = ["a", "b", "c", "d", "e", "f", "g"];

const DIGIT_SEGMENTS: Record<string, SegmentId[]> = {
  "0": ["a", "b", "c", "d", "e", "f"],
  "1": ["b", "c"],
  "2": ["a", "b", "g", "e", "d"],
  "3": ["a", "b", "g", "c", "d"],
  "4": ["f", "g", "b", "c"],
  "5": ["a", "f", "g", "c", "d"],
  "6": ["a", "f", "g", "e", "c", "d"],
  "7": ["a", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "9": ["a", "b", "c", "d", "f", "g"],
};

export function segmentsFor(digit: string): SegmentId[] {
  return DIGIT_SEGMENTS[digit] ?? [];
}

/** One digit cell, centred on the origin. `vertical` says which axis the long side runs along. */
export interface SegmentLayout {
  x: number;
  y: number;
  length: number;
  thickness: number;
  vertical: boolean;
}

const THICKNESS = 0.09;
const H_LEN = 0.36;
const V_LEN = 0.42;

export const SEGMENT_LAYOUT: Record<SegmentId, SegmentLayout> = {
  a: { x: 0, y: 0.47, length: H_LEN, thickness: THICKNESS, vertical: false },
  g: { x: 0, y: 0, length: H_LEN, thickness: THICKNESS, vertical: false },
  d: { x: 0, y: -0.47, length: H_LEN, thickness: THICKNESS, vertical: false },
  f: { x: -0.22, y: 0.235, length: V_LEN, thickness: THICKNESS, vertical: true },
  b: { x: 0.22, y: 0.235, length: V_LEN, thickness: THICKNESS, vertical: true },
  e: { x: -0.22, y: -0.235, length: V_LEN, thickness: THICKNESS, vertical: true },
  c: { x: 0.22, y: -0.235, length: V_LEN, thickness: THICKNESS, vertical: true },
};

export const DIGIT_CELL_WIDTH = 0.7;

/** The cell is 1.03 tall (0.47 + half a bar, twice). The mark contract allows 1.0. */
export const MARK_FIT = 1 / 1.0301; // a hair under: rounded boxes come out a few micro-units large

export interface MarkDigit {
  id: string;
  value: string;
}

export const MARK_DIGITS: MarkDigit[] = [
  { id: "hundreds", value: "4" },
  { id: "tens", value: "1" },
  { id: "ones", value: "1" },
];
