/** Furthest the mark turns to either side: 34 degrees. Past 90 it would show its back and read mirrored. */
export const SWING_ANGLE = 0.6;

/** Yaw at a given phase. Phase 0 faces front, like the flat mark it takes over from. */
export const swing = (phase: number) => SWING_ANGLE * Math.sin(phase);
