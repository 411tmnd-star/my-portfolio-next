/**
 * The 12 second loop as pure functions of time. No object keeps state between frames: everything on
 * screen is read from stateAt(t), so stateAt(0) and stateAt(12) must be the same picture.
 *
 *   0.0 - 2.0   Assemble   board unrolls, core rises, stations pop in, trace draws
 *   2.0 - 3.2   Activate   card slides in, core splits open
 *   3.2 - 9.8   Automate   robot rides the trace past each station
 *   9.8 - 11.8  Teardown   robot leaves, props go, board rolls up
 *  11.8 - 12.0  Hold       empty
 */
import { distanceTo, headingAt, PATH_LENGTH, RAMP_LENGTH, samplePath, STATION_SLOTS } from "./layout";

export const LOOP_SECONDS = 12;
/** Where the live stage waits until the mark has docked: assembled, core closed, card not in yet. */
export const IDLE_TIME = 2.0;
/** The frame shared by the three Process passes and the poster. */
export const PROCESS_TIME = 6.0;

export const BEATS = [
  { name: "Assemble", from: 0, to: 2.0 },
  { name: "Activate", from: 2.0, to: 3.2 },
  { name: "Automate", from: 3.2, to: 9.8 },
  { name: "Teardown", from: 9.8, to: 11.8 },
  { name: "Hold", from: 11.8, to: 12.0 },
] as const;

/** Running time to a time inside the loop. */
export function wrap(seconds: number): number {
  return ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
}

// ------------------------------------------------------------------ easing
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));
const smooth = (v: number) => v * v * (3 - 2 * v);
const easeInCubic = (v: number) => v * v * v;
const easeOutCubic = (v: number) => 1 - (1 - v) ** 3;
const easeInOutCubic = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);
/** Overshoots to about 1.1 and settles at 1. */
const easeOutBack = (v: number) => (v <= 0 ? 0 : v >= 1 ? 1 : 1 + 2.70158 * (v - 1) ** 3 + 1.70158 * (v - 1) ** 2);

/** In with overshoot, out without. */
function pop(t: number, inFrom: number, inTo: number, outFrom: number, outTo: number): number {
  return easeOutBack(ramp(t, inFrom, inTo)) * (1 - easeInCubic(ramp(t, outFrom, outTo)));
}
const hold = (t: number, inFrom: number, inTo: number, outFrom: number, outTo: number) =>
  smooth(ramp(t, inFrom, inTo)) * (1 - smooth(ramp(t, outFrom, outTo)));

// ------------------------------------------------------------------ the robot's ride
const RIDE_START = 3.2;
const RIDE_EDGE = 9.8;
const RIDE_END = 10.6;
const SPIN_UP = 0.6;
const SPEED = PATH_LENGTH / (RIDE_EDGE - RIDE_START - SPIN_UP / 2);

/** Distance along the trace: a short start, then one steady speed until it is off the ramp. */
export function rideDistance(t: number): number {
  const s = Math.min(Math.max(0, t - RIDE_START), RIDE_END - RIDE_START);
  return s < SPIN_UP ? (SPEED * s * s) / (2 * SPIN_UP) : SPEED * (s - SPIN_UP / 2);
}

/** The time at which the robot is at a distance. Inverse of rideDistance. */
export function timeAtDistance(d: number): number {
  const soft = (SPEED * SPIN_UP) / 2;
  return RIDE_START + (d < soft ? Math.sqrt((2 * SPIN_UP * d) / SPEED) : d / SPEED + SPIN_UP / 2);
}

export const STATION_TIMES = STATION_SLOTS.map((s) => timeAtDistance(distanceTo(s.from)));

// ------------------------------------------------------------------ state
export type EngineState = {
  /** Scale of the rolled board and the unrolled fraction of its length. */
  boardScale: number;
  boardUnrolled: number;
  fittings: number;
  core: number;
  /** The 411 on the core: up with it, down with it. */
  hub: number;
  /** 0 closed, 1 split open. */
  coreOpen: number;
  coreLight: number;
  /** Drawn part of the trace, from..to, as fractions of its length. */
  traceFrom: number;
  traceTo: number;
  ramp: number;
  card: number;
  /** Index of the station the card shows, -1 for the opening line. */
  cardStation: number;
  stations: { scale: number; lit: number; spur: number }[];
  /** Two small board props. */
  props: [number, number];
  robot: { visible: number; x: number; y: number; z: number; heading: number };
  /** Five equaliser bars on the audio-lab station, whole cycles per loop. */
  bars: number[];
};

export function stateAt(t: number): EngineState {
  const d = t >= RIDE_END ? 0 : rideDistance(t); // unseen from here on, so it is already back inside the core
  const at = samplePath(d);
  const offBoard = clamp01((d - PATH_LENGTH) / RAMP_LENGTH);

  let cardStation = -1;
  STATION_TIMES.forEach((when, i) => {
    if (t >= when - 0.1) cardStation = i;
  });

  return {
    boardScale: easeOutCubic(ramp(t, 0.04, 0.2)) * (1 - easeInCubic(ramp(t, 11.64, 11.8))),
    boardUnrolled: easeInOutCubic(ramp(t, 0.18, 0.85)) * (1 - easeInOutCubic(ramp(t, 11.1, 11.68))),
    fittings: pop(t, 0.8, 1.1, 10.9, 11.1),
    core: pop(t, 0.65, 1.12, 10.82, 11.1),
    hub: pop(t, 0.95, 1.4, 10.7, 10.95),
    coreOpen: easeInOutCubic(ramp(t, 2.4, 3.0)) * (1 - easeInOutCubic(ramp(t, 4.6, 5.1))),
    coreLight: hold(t, 2.45, 3.0, 4.7, 5.1),
    // once erased it is not drawn again: both ends go back to the start
    traceFrom: t >= 11.0 ? 0 : easeInOutCubic(ramp(t, 10.62, 11.0)),
    traceTo: t >= 11.0 ? 0 : easeInOutCubic(ramp(t, 1.25, 2.0)),
    ramp: easeOutCubic(ramp(t, 9.35, 9.8)) * (1 - easeInCubic(ramp(t, 10.62, 10.85))),
    card: easeOutBack(ramp(t, 2.0, 2.5)) * (1 - easeInCubic(ramp(t, 10.0, 10.35))),
    cardStation: t >= 10.4 ? -1 : cardStation,
    stations: STATION_TIMES.map((when, i) => ({
      scale: pop(t, 0.92 + i * 0.12, 1.36 + i * 0.12, 10.4 + i * 0.07, 10.72 + i * 0.07),
      lit: hold(t, when - 0.18, when + 0.12, 10.1, 10.4),
      spur: hold(t, 1.7, 2.0, 10.4, 10.6),
    })),
    props: [pop(t, 1.1, 1.5, 10.6, 10.9), pop(t, 1.22, 1.62, 10.66, 10.96)],
    robot: {
      visible: t >= 2.2 && t < RIDE_END ? 1 - easeInCubic(ramp(t, 10.3, RIDE_END)) : 0,
      x: at.x,
      y: -0.02 * offBoard,
      z: at.z,
      heading: headingAt(d),
    },
    bars: [2, 3, 4, 3, 5].map((cycles, i) => 0.55 + 0.45 * Math.sin((2 * Math.PI * cycles * t) / LOOP_SECONDS + i * 1.3)),
  };
}
