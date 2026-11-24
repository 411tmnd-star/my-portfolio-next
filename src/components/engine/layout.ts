/**
 * Where everything stands on the board. World units: the board is 10 x 10, its top face is y = 0,
 * +x runs right-down on screen and +z runs left-down. The camera is true isometric and never moves.
 */

export type Vec3 = [number, number, number];
export type Point = { x: number; z: number };

export const PALETTE = {
  ground: "#0B0E12",
  panel: "#161B22",
  board: "#272F36",
  edge: "#3A4A55",
  amber: "#E08030",
  cyan: "#35E0F2",
  text: "#E6EDF3",
} as const;

export const BOARD = { size: 10, thickness: 0.26, corner: 1.1, bevel: 0.07 } as const;

/** Frame: the visible height in world units, at a fixed 16:10 shape. */
export const VIEW_HEIGHT = 10.8;
export const FRAME_ASPECT = 16 / 10;
export const CAMERA_TARGET: Vec3 = [0, 0.35, 0];
export const CAMERA_DISTANCE = 40;

/** True isometric: 54.736 degrees from the vertical, 45 degrees around it. */
export const ISO_TILT = Math.atan(Math.SQRT1_2); // 35.264 degrees above the horizon
export const ISO_YAW = -Math.PI / 4;

export const CORE = { x: -1.9, z: -3.0, width: 3.0, height: 2.1, depth: 2.0, roof: 0.16, gap: 0.62 } as const;

/** The 411 stands on the core. Mark contract: 2.1 x 1.0 x 0.3 around its own origin. */
export const HUB_SCALE = 1.25;
export const HUB: Vec3 = [CORE.x, CORE.height + CORE.roof + 0.5 * HUB_SCALE + 0.06, CORE.z];

/** The trace. Every corner is 45 degrees. */
export const PATH: Point[] = [
  { x: -1.9, z: -3.0 },
  { x: -1.9, z: -1.3 },
  { x: -2.9, z: -0.3 },
  { x: -2.9, z: 2.0 },
  { x: -1.7, z: 3.2 },
  { x: 0.1, z: 3.2 },
  { x: 1.1, z: 2.2 },
  { x: 1.1, z: -1.6 },
  { x: 2.1, z: -2.6 },
  { x: 2.5, z: -2.6 },
  { x: 3.5, z: -1.6 },
  { x: 3.5, z: 5.0 },
];
/** Beyond the front edge, only while the ramp is out. */
export const RAMP_LENGTH = 1.7;

export type StationSlot = {
  id: string;
  /** Centre of the object on the board. */
  at: Point;
  /** Where its spur leaves the trace. */
  from: Point;
  /** Height of the label anchor above the board. */
  labelY: number;
  /** Which way the label grows from its anchor. */
  side: "left" | "right" | "up";
};

/** In path order. Which of them are shown is decided by content/projects.ts. */
export const STATION_SLOTS: StationSlot[] = [
  { id: "maximus-character-rig", at: { x: -4.1, z: 0.9 }, from: { x: -2.9, z: 0.9 }, labelY: 0.5, side: "left" },
  { id: "maximus-garment-physics", at: { x: -0.8, z: 4.25 }, from: { x: -0.8, z: 3.2 }, labelY: -0.2, side: "left" },
  { id: "better-style-asset-pipeline", at: { x: -0.5, z: 0.5 }, from: { x: 1.1, z: 0.5 }, labelY: 1.15, side: "up" },
  { id: "audio-lab", at: { x: 2.3, z: -4.0 }, from: { x: 2.3, z: -2.6 }, labelY: 1.2, side: "right" },
  { id: "humanoid-robot", at: { x: 2.25, z: 1.5 }, from: { x: 3.5, z: 1.5 }, labelY: 1.35, side: "right" },
];

export const CARD = { center: [-5.5, 3.45] as [number, number], width: 4.0, height: 2.1 } as const;

// ------------------------------------------------------------------ path maths
export type PathSample = { x: number; z: number; dx: number; dz: number };

const segments = PATH.slice(1).map((b, i) => {
  const a = PATH[i];
  return { a, dx: b.x - a.x, dz: b.z - a.z, length: Math.hypot(b.x - a.x, b.z - a.z) };
});
export const PATH_LENGTH = segments.reduce((sum, s) => sum + s.length, 0);

/** Point and unit direction at a distance along the trace. Past the end it carries straight on. */
export function samplePath(distance: number): PathSample {
  let rest = Math.max(0, distance);
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (rest <= s.length || i === segments.length - 1) {
      const k = rest / s.length;
      return { x: s.a.x + s.dx * k, z: s.a.z + s.dz * k, dx: s.dx / s.length, dz: s.dz / s.length };
    }
    rest -= s.length;
  }
  throw new Error("empty path");
}

/** Heading in radians about +Y for a model that faces +Z, turned smoothly through the corners. */
export function headingAt(distance: number, reach = 0.5): number {
  const a = samplePath(Math.max(0, distance - reach));
  const b = samplePath(distance + reach);
  return Math.atan2(b.x - a.x, b.z - a.z);
}

/** Distance along the trace of the point nearest to p. */
export function distanceTo(p: Point): number {
  let best = Infinity;
  let at = 0;
  let walked = 0;
  for (const s of segments) {
    const k = Math.min(1, Math.max(0, ((p.x - s.a.x) * s.dx + (p.z - s.a.z) * s.dz) / (s.length * s.length)));
    const d = Math.hypot(s.a.x + s.dx * k - p.x, s.a.z + s.dz * k - p.z);
    if (d < best - 1e-9) {
      best = d;
      at = walked + k * s.length;
    }
    walked += s.length;
  }
  return at;
}

// ------------------------------------------------------------------ projection
/** World point to the fraction of the frame (0..1 from the left, 0..1 from the top). Used for the DOM labels. */
export function project([x, y, z]: Vec3): { left: number; top: number } {
  const [tx, ty, tz] = CAMERA_TARGET;
  const right = ((x - tx) - (z - tz)) * Math.SQRT1_2;
  const up = (2 * (y - ty) - (x - tx) - (z - tz)) / Math.sqrt(6);
  return { left: 0.5 + right / (VIEW_HEIGHT * FRAME_ASPECT), top: 0.5 - up / VIEW_HEIGHT };
}
