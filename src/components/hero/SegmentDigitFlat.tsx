import { ALL_SEGMENTS, MARK_DIGITS, SEGMENT_LAYOUT, segmentsFor } from "@/lib/sevenSegment";

/**
 * Flat version of the same digit in plain positioned divs: the first paint, no WebGL, reduced motion and
 * no JavaScript all show this. Same segment table as the 3D digit, so both are the same mark.
 */
export function SegmentDigitFlat({ digit }: { digit: string }) {
  const active = new Set(segmentsFor(digit));

  return (
    <span className="relative block h-full" style={{ aspectRatio: "0.7 / 1.03" }}>
      {ALL_SEGMENTS.map((id) => {
        const s = SEGMENT_LAYOUT[id];
        const w = (s.vertical ? s.thickness : s.length) / 0.7;
        const h = (s.vertical ? s.length : s.thickness) / 1.03;
        return (
          <span
            key={id}
            data-segment={active.has(id) ? "on" : "off"}
            className="absolute block rounded-[3px]"
            style={{
              left: `${50 + (s.x / 0.7) * 100}%`,
              top: `${50 - (s.y / 1.03) * 100}%`,
              width: `${w * 100}%`,
              height: `${h * 100}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: active.has(id) ? "var(--color-amber)" : "rgb(58 62 69 / 0.35)",
            }}
          />
        );
      })}
    </span>
  );
}

export function FlatMark() {
  return (
    <span className="flex h-full justify-center" data-testid="flat-mark">
      {MARK_DIGITS.map(({ id, value }) => (
        <SegmentDigitFlat key={id} digit={value} />
      ))}
    </span>
  );
}
