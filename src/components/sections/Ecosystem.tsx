type Status = "Shipped" | "In progress" | "Planned";

const NODES: { name: string; status: Status }[] = [
  { name: "411 AOS", status: "In progress" },
  { name: "411 Market", status: "Planned" },
  { name: "411 Live", status: "Planned" },
  { name: "Smart Energy / VoltaEdge", status: "In progress" },
  { name: "411 Connect", status: "Planned" },
  { name: "411 Voice", status: "Planned" },
  { name: "411 Film / Bots", status: "Planned" },
  { name: "411 Analytics", status: "Planned" },
];

const STATUS_STYLE: Record<Status, string> = {
  Shipped: "text-[var(--color-cyan)] border-[var(--color-cyan)]/40",
  "In progress": "text-[var(--color-copper-highlight)] border-[var(--color-copper)]/40",
  Planned: "text-[var(--color-muted)] border-white/10",
};

export default function Ecosystem() {
  return (
    <section id="ecosystem" className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-2xl font-semibold text-[var(--color-silkscreen)]">Ecosystem</h2>
      <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
        Eight products, one board. Reference designators, not marketing names —
        every tile below carries an honest status.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {NODES.map((n, i) => (
          <div
            key={n.name}
            className="rounded-xl border border-white/10 bg-[var(--color-panel)] p-4"
          >
            <div className="font-mono-brand text-xs text-[var(--color-muted)]">
              U{i + 1}
            </div>
            <div className="mt-2 text-sm font-medium text-[var(--color-silkscreen)]">
              {n.name}
            </div>
            <div
              className={`mt-3 inline-block rounded-full border px-2 py-0.5 font-mono-brand text-[10px] uppercase tracking-wider ${STATUS_STYLE[n.status]}`}
            >
              {n.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
