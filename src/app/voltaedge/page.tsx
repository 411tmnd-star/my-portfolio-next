import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Pipeline from "@/components/voltaedge/Pipeline";
import { VOLTA } from "@/content/voltaedge";

const OG_DESC =
  "Embedded C/C++, TinyML load recognition and IoT telemetry — an intelligence layer between the meter and the building, engineered for unreliable power infrastructure.";

export const metadata: Metadata = {
  title: "VoltaEdge AI — Edge Energy Intelligence | 411 Ecosystem",
  description:
    "VoltaEdge AI — Edge intelligence and energy management platform engineered for unreliable power infrastructure by Michael Ikhine.",
  alternates: { canonical: "/voltaedge" },
  openGraph: {
    siteName: "411 Ecosystem",
    title: "VoltaEdge AI — Edge Energy Intelligence",
    description: OG_DESC,
    type: "article",
    locale: "en_NG",
    url: "/voltaedge",
    images: [
      { url: "/og-voltaedge.png", type: "image/png", width: 1200, height: 630, alt: "VoltaEdge AI — CT sensors to ESP32 edge AI to AOS telemetry" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoltaEdge AI — Edge Energy Intelligence",
    description: "Embedded C/C++, TinyML load recognition and IoT telemetry, engineered for unreliable power infrastructure.",
    images: [{ url: "/og-voltaedge.png", alt: "VoltaEdge AI — CT sensors to ESP32 edge AI to AOS telemetry" }],
  },
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block font-mono-brand text-[11.5px] uppercase tracking-[0.13em] text-[var(--color-copper-highlight)]">
      {children}
    </span>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 mb-4 text-[26px] font-bold leading-[1.25]">{children}</h2>;
}

const section = "px-0 py-[60px]";

export default function VoltaEdgePage() {
  const v = VOLTA;
  return (
    <>
      <Nav variant="sub" />
      <main>
        <section className="relative overflow-hidden border-b border-[var(--color-line)] pb-10 pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[100px] -top-[150px] h-[450px] w-[450px] bg-[radial-gradient(circle,rgb(184_115_51/0.14),transparent_70%)]"
          />
          <div className="wrap relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgb(184_115_51/0.3)] bg-[rgb(184_115_51/0.08)] px-3 py-1 font-mono-brand text-[11px] uppercase text-[var(--color-copper-highlight)]">
              {v.badge}
            </div>
            <h1 className="m-0 mb-4 text-[clamp(32px,5vw,50px)] font-bold leading-[1.15] tracking-tight">
              {v.titleBefore}
              <span className="text-[var(--color-copper-highlight)]">{v.titleAccent}</span>
              {v.titleAfter}
            </h1>
            <p className="mb-[30px] max-w-[720px] text-[17px] text-[var(--color-muted)]">{v.lead}</p>
          </div>
        </section>

        <section className={section}>
          <div className="wrap">
            <Label>{v.problem.label}</Label>
            <Title>{v.problem.title}</Title>
            <p className="max-w-[680px] text-[var(--color-muted)]">{v.problem.sub}</p>
            <div className="mt-[30px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
              {v.problem.cards.map((c) => (
                <div key={c.title} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-[22px]">
                  <div className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-[var(--color-copper-highlight)]">{c.title}</div>
                  <div className="text-[13.5px] text-[var(--color-muted)]">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${section} bg-[var(--color-panel)]`}>
          <div className="wrap">
            <Label>{v.system.label}</Label>
            <Title>{v.system.title}</Title>
            <p className="text-[var(--color-muted)]">{v.system.sub}</p>
            <div className="my-[30px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-2)] p-7">
              <Pipeline nodes={v.system.pipe} />
              <p className="mt-[26px] text-left font-mono-brand text-[11.5px] leading-[1.7] text-[var(--color-muted)] min-[821px]:text-center">
                {v.system.noteBefore}
                <strong className="font-semibold text-[var(--color-copper-highlight)]">{v.system.noteStrong}</strong>
                {v.system.noteAfter}
              </p>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className="wrap">
            <Label>{v.ui.label}</Label>
            <Title>{v.ui.title}</Title>
            <p className="text-[var(--color-muted)]">{v.ui.sub}</p>
            <figure className="mx-auto my-[30px] max-w-[480px]">
              <div className="rounded-2xl border border-[var(--color-line)] bg-[#080a0d] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                <div className="mb-5 flex items-center justify-between border-b border-[var(--color-line)] pb-3">
                  <span className="font-mono-brand text-[11px] text-[var(--color-muted)]">{v.ui.appName}</span>
                  <span className="font-mono-brand text-[11px] text-[#27c93f]">{v.ui.appStatus}</span>
                </div>
                <div className="mb-4 rounded-xl border border-[rgb(184_115_51/0.3)] bg-[linear-gradient(135deg,rgb(184_115_51/0.15)_0%,rgb(22_27_34/0.8)_100%)] p-5 text-center">
                  <div className="mb-1.5 text-[11px] uppercase tracking-[0.09em] text-[var(--color-muted)]">{v.ui.costLabel}</div>
                  <div className="font-mono-brand text-[32px] font-bold">{v.ui.cost}</div>
                  <div className="mt-1 font-mono-brand text-xs text-[#27c93f]">{v.ui.subcost}</div>
                </div>
                <div className="rounded-r-lg border-l-[3px] border-[var(--color-cyan)] bg-[var(--color-panel)] px-3.5 py-3 text-left text-[12.5px]">
                  <strong className="mb-0.5 block text-[var(--color-copper-highlight)]">{v.ui.insightTitle}</strong>
                  {v.ui.insight}
                </div>
              </div>
              <figcaption className="mt-3 text-center font-mono-brand text-[11px] text-[var(--color-muted)]">{v.ui.mockLabel}</figcaption>
            </figure>
          </div>
        </section>

        <section className={`${section} bg-[var(--color-panel)]`}>
          <div className="wrap">
            <Label>{v.nilm.label}</Label>
            <Title>{v.nilm.title}</Title>
            <p className="max-w-[700px] text-[var(--color-muted)]">{v.nilm.sub}</p>
            <div className="my-[30px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-2)] p-7">
              <div className="mb-3 font-mono-brand text-[13px] text-[var(--color-cyan)]">{v.nilm.pipelineTitle}</div>
              <p className="m-0 text-[13.5px] text-[var(--color-muted)]">{v.nilm.pipeline}</p>
            </div>
          </div>
        </section>

        <section className={section}>
          <div className="wrap">
            <Label>{v.specs.label}</Label>
            <Title>{v.specs.title}</Title>
            <p className="mb-6 text-[var(--color-muted)]">{v.specs.sub}</p>

            <details open className="spec group mb-3.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-4 open:border-[rgb(184_115_51/0.4)]">
              <summary className="flex cursor-pointer list-none items-center justify-between font-mono-brand text-sm font-semibold">
                {v.specs.core.summary} <span aria-hidden="true" className="transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 overflow-x-auto border-t border-[var(--color-line)] pt-4">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr>
                      {["Layer", "Selected Hardware", "Function"].map((h) => (
                        <th key={h} className="border-b border-[var(--color-line)] p-2 font-mono-brand font-normal text-[var(--color-muted)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {v.specs.core.rows.map((r) => (
                      <tr key={r[0]}>
                        {r.map((c) => (
                          <td key={c} className="border-b border-[rgb(230_237_243/0.04)] px-2 py-2.5">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            <details className="spec group mb-3.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-4 open:border-[rgb(184_115_51/0.4)]">
              <summary className="flex cursor-pointer list-none items-center justify-between font-mono-brand text-sm font-semibold">
                {v.specs.safety.summary} <span aria-hidden="true" className="transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4 border-t border-[var(--color-line)] pt-4">
                <p className="text-[13px] text-[var(--color-muted)]">
                  <strong className="text-[var(--color-silkscreen)]">{v.specs.safety.noticeStrong}</strong>
                  {v.specs.safety.notice}
                </p>
                <ul className="list-disc pl-5 text-[13px] leading-[1.8] text-[var(--color-muted)]">
                  {v.specs.safety.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </section>

        <section className={`${section} bg-[var(--color-panel)]`}>
          <div className="wrap">
            <Label>{v.roadmap.label}</Label>
            <Title>{v.roadmap.title}</Title>
            <p className="text-[var(--color-muted)]">{v.roadmap.sub}</p>
            <div className="mt-6 flex flex-col gap-4">
              {v.roadmap.items.map((r) => (
                <div key={r.badge} className="flex flex-col items-start gap-1.5 md:flex-row md:gap-4">
                  <span
                    className={`min-w-[130px] whitespace-nowrap rounded-md border bg-[var(--color-panel-2)] px-2.5 py-1 text-center font-mono-brand text-[11px] ${"active" in r && r.active ? "border-[var(--color-copper-highlight)] text-[var(--color-copper-highlight)]" : "border-[var(--color-line)]"}`}
                  >
                    {r.badge}
                  </span>
                  <div className="text-[13.5px] text-[var(--color-muted)]">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[var(--color-line)] px-[6vw] py-7 text-center font-mono-brand text-[11.5px] text-[var(--color-muted)]">
        {v.footer}
      </footer>
    </>
  );
}
