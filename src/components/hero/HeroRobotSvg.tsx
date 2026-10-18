/**
 * Interim hero robot — the approved SVG greeting from the live site,
 * ported 1:1 (see docs/411-ROBOT-PROTOTYPE.md). It holds the hero until the
 * real 3D humanoid (Humanoid-Robot repo → .glb → React Three Fiber) replaces
 * it in step 3 of docs/REFINEMENT-PLAN.md. Same greeting story either way:
 * idle → notice → HELLO → 411 → follow cursor.
 */
export default function HeroRobotSvg() {
  return (
    <svg
      className="block h-auto w-full max-w-[104px] overflow-visible sm:max-w-[158px] lg:max-w-[330px]"
      viewBox="0 0 400 470"
      role="img"
      aria-label="A 411 robot, its visor lit."
    >
      <defs>
        <linearGradient id="gShell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232830" />
          <stop offset="100%" stopColor="#12151a" />
        </linearGradient>
        <linearGradient id="gVisor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0d11" />
          <stop offset="100%" stopColor="#05070a" />
        </linearGradient>
        <radialGradient id="gFace" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="rgba(53,224,242,0.30)" />
          <stop offset="100%" stopColor="rgba(53,224,242,0)" />
        </radialGradient>
        <clipPath id="visorClip">
          <rect x="112" y="150" width="176" height="60" rx="26" />
        </clipPath>
      </defs>

      <g>
        <path d="M92 470 V416 q0-42 44-52 l28-7 h72 l28 7 q44 10 44 52 V470 Z" fill="url(#gShell)" />
        <path d="M92 470 V416 q0-42 44-52 l28-7 h72 l28 7 q44 10 44 52 V470 Z" fill="none" stroke="rgba(230,237,243,0.14)" strokeWidth="1.4" />
        <rect x="176" y="404" width="48" height="5" rx="2.5" fill="rgba(230,237,243,0.07)" />
        <rect x="168" y="418" width="64" height="5" rx="2.5" fill="rgba(230,237,243,0.05)" />
        <circle className="robot-sensor" cx="200" cy="443" r="4" />
      </g>

      <g className="robot-breathe">
        <path d="M170 250 h60 v122 q-30 14 -60 0 Z" fill="#161a20" />
        <path d="M170 300 h60" stroke="rgba(230,237,243,0.10)" strokeWidth="1" fill="none" />

        <g id="robotHead" className="robot-head">
          <path d="M200 44 q66 0 90 30 q22 28 22 84 q0 62 -26 92 q-30 34 -86 34 q-56 0 -86 -34 q-26 -30 -26 -92 q0 -56 22 -84 q24 -30 90 -30 Z" fill="url(#gShell)" />
          <path d="M200 44 q66 0 90 30 q22 28 22 84 q0 62 -26 92 q-30 34 -86 34 q-56 0 -86 -34 q-26 -30 -26 -92 q0 -56 22 -84 q24 -30 90 -30 Z" fill="none" stroke="rgba(230,237,243,0.14)" strokeWidth="1.4" />
          <path d="M138 78 q62 -20 124 0" stroke="rgba(230,237,243,0.10)" strokeWidth="1" fill="none" />
          <rect x="186" y="56" width="28" height="4" rx="2" fill="rgba(53,224,242,0.16)" />

          {[86, 292].map((x) => (
            <g key={x}>
              <rect x={x} y="140" width="22" height="62" rx="9" fill="#1B2129" />
              <rect x={x} y="140" width="22" height="62" rx="9" fill="none" stroke="rgba(230,237,243,0.14)" strokeWidth="1.4" />
              <rect x={x + 7} y="156" width="8" height="3" rx="1.5" fill="rgba(230,237,243,0.13)" />
              <rect x={x + 7} y="166" width="8" height="3" rx="1.5" fill="rgba(230,237,243,0.13)" />
            </g>
          ))}

          <path d="M124 126 h152 q14 0 14 16 v82 q0 16 -16 16 h-148 q-16 0 -16 -16 v-82 q0 -16 14 -16 Z" fill="#0f1116" />
          <ellipse className="robot-glow" cx="200" cy="176" rx="104" ry="72" fill="url(#gFace)" />
          <rect x="112" y="150" width="176" height="60" rx="26" fill="url(#gVisor)" />
          <rect x="112" y="150" width="176" height="60" rx="26" fill="none" stroke="rgba(230,237,243,0.14)" strokeWidth="1.4" />

          <g clipPath="url(#visorClip)">
            <g id="robotEyes">
              <rect className="robot-eye" x="152" y="168" width="30" height="24" rx="9" />
              <rect className="robot-eye" x="218" y="168" width="30" height="24" rx="9" />
            </g>
            <text id="robotGreet" className="robot-greet" x="200" y="181" fontSize="27">
              HELLO
            </text>
          </g>

          <rect x="180" y="226" width="40" height="5" rx="2.5" fill="rgba(230,237,243,0.08)" />
          <circle className="robot-sensor" cx="200" cy="112" r="3.5" />
        </g>
      </g>
    </svg>
  );
}
