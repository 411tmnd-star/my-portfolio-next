import { READY_PROJECTS } from "@/content/projects";

/**
 * The recovered CommandCenterPipeline diagram as plain SVG: 411 in the middle, dashed lines out to each
 * project and round to the next. Shown when WebGL2 is missing. No diagram library, no script.
 */
const W = 960;
const H = 600;
const C = { x: W / 2, y: H / 2 };
const R = { x: 330, y: 205 };

export function StaticPipeline() {
  const nodes = READY_PROJECTS.map((p, i) => {
    const angle = (i / READY_PROJECTS.length) * Math.PI * 2 - Math.PI / 2;
    return { p, x: C.x + Math.cos(angle) * R.x, y: C.y + Math.sin(angle) * R.y };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="static-pipeline" role="img" aria-label="411 in the middle, linked to each project" data-testid="static-pipeline">
      <g fill="none" stroke="var(--color-amber)" strokeWidth="1.5" strokeDasharray="6 6">
        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length];
          return <path key={n.p.id} d={`M ${n.x} ${n.y} L ${next.x} ${next.y} M ${C.x} ${C.y} L ${n.x} ${n.y}`} />;
        })}
      </g>
      <circle cx={C.x} cy={C.y} r="46" fill="var(--color-panel)" stroke="var(--color-amber)" strokeWidth="2" />
      <text x={C.x} y={C.y + 6} textAnchor="middle" className="static-hub">411</text>
      {nodes.map(({ p, x, y }) => (
        <g key={p.id} transform={`translate(${x - 125} ${y - 34})`}>
          <rect width="250" height="68" rx="10" fill="var(--color-panel)" stroke="var(--color-substrate-edge)" />
          <text x="16" y="28" className="static-title">{p.title}</text>
          <text x="16" y="50" className="static-line">{p.cardLine}</text>
        </g>
      ))}
    </svg>
  );
}
