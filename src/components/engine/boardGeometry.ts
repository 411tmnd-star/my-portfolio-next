import { BufferAttribute, BufferGeometry } from "three";
import { BOARD } from "./layout";

/**
 * A flexible board that unrolls from a cylinder along +x.
 *
 * The material point at distance s from the fixed edge lies flat while s <= f (f = unrolled length).
 * Beyond f it wraps onto a spiral that sits on the board: the outer radius follows from the area of the
 * rolled part, so no layer passes through another and no length is created or lost.
 */
const { size: L, thickness: T, corner: C, bevel: B } = BOARD;
const INNER_RADIUS = 0.34;
const PITCH = T * 1.12; // distance between two layers
const COLUMNS = 160;

export type BoardFrame = { x: number; y: number; nx: number; ny: number };

/** Where the top-face point at distance s sits, with the unit normal of the top face. */
export function boardFrame(s: number, f: number): BoardFrame {
  if (s <= f) return { x: s, y: 0, nx: 0, ny: 1 };
  const outer = Math.sqrt(INNER_RADIUS ** 2 + ((L - f) * PITCH) / Math.PI);
  const radius = Math.sqrt(Math.max(1e-9, outer * outer - ((s - f) * PITCH) / Math.PI));
  const angle = ((2 * Math.PI) / PITCH) * (outer - radius);
  // The outside of the roll is the board's underside, so the top face points at the axis.
  return { x: f + radius * Math.sin(angle), y: outer - radius * Math.cos(angle), nx: -Math.sin(angle), ny: Math.cos(angle) };
}

/** Half width at distance s of a rounded square of the given size and corner radius. */
export function halfWidth(s: number, size: number = L, corner: number = C): number {
  const edge = Math.max(0, Math.min(s, size - s));
  if (edge >= corner) return size / 2;
  const k = (corner - edge) / corner;
  return size / 2 - corner * (1 - Math.sqrt(Math.max(0, 1 - k * k)));
}

/** A point of the cross section: across the board, height, and its own distance along it. */
type P = { z: number; h: number; s: number };
/** Outward plan normal (along, across) and how far the face leans up. */
type Face = { a: P; b: P; along: number; across: number; up: number };

const SIN = Math.SQRT1_2;

/** The bevelled cross section at column s. Rim points lie on the outline, the rest on an outline inset by B. */
function section(s: number): Face[] {
  const inner = B + (s * (L - 2 * B)) / L;
  const w = halfWidth(s);
  const wi = halfWidth(inner - B, L - 2 * B, C - B);
  const edge = Math.max(0, Math.min(s, L - s));
  const k = edge >= C ? 0 : (C - edge) / C;
  const along = (s < L / 2 ? -1 : 1) * k;
  const across = Math.sqrt(Math.max(0, 1 - k * k));
  const at = (z: number, h: number, inset: boolean): P => ({ z, h, s: inset ? inner : s });
  const side = (sign: 1 | -1): Face[] => {
    const low = at(sign * wi, -T, true);
    const rimLow = at(sign * w, -T + B, false);
    const rimHigh = at(sign * w, -B, false);
    const top = at(sign * wi, 0, true);
    const n = { along, across: sign * across };
    const faces: Face[] = [
      { a: low, b: rimLow, along: n.along * SIN, across: n.across * SIN, up: -SIN },
      { a: rimLow, b: rimHigh, ...n, up: 0 },
      { a: rimHigh, b: top, along: n.along * SIN, across: n.across * SIN, up: SIN },
    ];
    return sign === 1 ? faces : faces.map((f) => ({ ...f, a: f.b, b: f.a })).reverse();
  };
  const right = side(1);
  const left = side(-1);
  return [
    ...right,
    { a: right[2].b, b: left[0].a, along: 0, across: 0, up: 1 },
    ...left,
    { a: left[2].b, b: right[0].a, along: 0, across: 0, up: -1 },
  ];
}

/** Column positions, closer together towards both ends so that the corners read as round. */
const COLS = Array.from({ length: COLUMNS + 1 }, (_, i) => {
  const k = i / COLUMNS;
  return L * (k - (Math.sin(2 * Math.PI * k) / (2 * Math.PI)) * 0.9);
});
const SECTIONS = COLS.map(section);
const FACES = 8;
const SIDE_VERTICES = FACES * COLS.length * 2;

export class BoardGeometry extends BufferGeometry {
  private last = Number.NaN;

  constructor(fraction = 1) {
    super();
    const n = SIDE_VERTICES + 2 * 3 * 4; // plus three quads on each end
    this.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
    this.setAttribute("normal", new BufferAttribute(new Float32Array(n * 3), 3));
    const index: number[] = [];
    const row = COLS.length * 2;
    for (let e = 0; e < FACES; e++) {
      for (let c = 0; c < COLS.length - 1; c++) {
        const a = e * row + c * 2;
        index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    for (let q = 0; q < 6; q++) {
      const a = SIDE_VERTICES + q * 4;
      if (q < 3) index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      else index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    this.setIndex(index);
    this.unroll(fraction);
  }

  /** Set the unrolled fraction, 0..1. Does nothing when it has not changed. */
  unroll(fraction: number): void {
    if (fraction === this.last) return;
    this.last = fraction;
    const f = fraction * L;
    const pos = this.getAttribute("position") as BufferAttribute;
    const nor = this.getAttribute("normal") as BufferAttribute;
    let v = 0;
    const put = (p: P, along: number, across: number, up: number) => {
      const fr = boardFrame(p.s, f);
      pos.setXYZ(v, fr.x - L / 2 + fr.nx * p.h, fr.y + fr.ny * p.h, p.z);
      nor.setXYZ(v, fr.nx * up + fr.ny * along, fr.ny * up - fr.nx * along, across);
      v++;
    };
    for (let e = 0; e < FACES; e++) {
      for (let c = 0; c < COLS.length; c++) {
        const { a, b, along, across, up } = SECTIONS[c][e];
        put(a, along, across, up);
        put(b, along, across, up);
      }
    }
    for (const [c, end] of [[0, -1], [COLS.length - 1, 1]] as const) {
      const sec = SECTIONS[c];
      for (let q = 0; q < 3; q++) {
        const r = sec[q];
        const l = sec[6 - q];
        const lean = q === 1 ? 0 : q === 0 ? -SIN : SIN;
        const along = q === 1 ? end : end * SIN;
        for (const p of [r.a, r.b, l.b, l.a]) put(p, along, 0, lean);
      }
    }
    pos.needsUpdate = true;
    nor.needsUpdate = true;
    this.computeBoundingSphere();
  }
}
