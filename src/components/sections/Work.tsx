import Link from "next/link";
import { WORK } from "@/content/site";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

function Pills({ items }: { items: string[] }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((p) => (
        <span key={p} className="pill">
          {p}
        </span>
      ))}
    </div>
  );
}

function Tag({ children, cyan = true }: { children: React.ReactNode; cyan?: boolean }) {
  return (
    <div
      className={`mb-[18px] font-mono-brand text-[11.5px] uppercase tracking-[0.05em] ${cyan ? "text-[var(--color-cyan)]" : "text-[var(--color-copper-highlight)]"}`}
    >
      {children}
    </div>
  );
}

/**
 * §4b Work & planned architecture — the proof cards, ported 1:1.
 * Planned work keeps its [PLANNED ARCHITECTURE] tag; the next-case-study tile
 * stays an honest invitation, not a fabricated project.
 */
export default function Work() {
  return (
    <section id="work" aria-label="Work and planned architecture">
      <div className="wrap">
        <div className="mb-[50px] flex flex-col gap-7">
          <article className="card card-featured flex flex-col px-8 py-9">
            <Tag>{WORK.aos.tag}</Tag>
            <h3 className="m-0 mb-5 text-[22px] font-semibold leading-[1.3]">{WORK.aos.title}</h3>
            <p className="mb-6 text-[14.5px] leading-[1.7] text-[var(--color-muted)]">{WORK.aos.desc}</p>
            <Pills items={WORK.aos.pills} />
          </article>

          <article className="card card-featured flex flex-col px-8 py-9">
            <Tag>{WORK.voice.tag}</Tag>
            <h3 className="m-0 mb-5 text-[22px] font-semibold leading-[1.3]">{WORK.voice.title}</h3>
            {/* Static by design: no audio, no simulated demo — there is no
                shipped speech model behind this to demonstrate. */}
            <ul className="m-0 mb-2 flex list-none flex-wrap gap-2 p-0">
              {WORK.voice.langs.map((l) => (
                <li key={l} className="rounded-lg border border-[rgb(53_224_242/0.22)] bg-[rgb(53_224_242/0.06)] px-[13px] py-[7px] font-mono-brand text-[12.5px] tracking-[0.05em]">
                  {l}
                </li>
              ))}
            </ul>
            <p className="mb-[18px] font-mono-brand text-[11px] text-[var(--color-muted)]">{WORK.voice.caption}</p>
            <p className="mb-6 text-[14.5px] leading-[1.7] text-[var(--color-muted)]">{WORK.voice.desc}</p>
            <Pills items={WORK.voice.pills} />
          </article>

          <article className="card card-featured flex flex-col px-8 py-9">
            <Tag>{WORK.volta.tag}</Tag>
            <h3 className="m-0 mb-5 text-[22px] font-semibold leading-[1.3]">{WORK.volta.title}</h3>
            <div className="relative mb-[26px] overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-[#080a0d] p-5">
              <div className="mb-[18px] flex items-center gap-[7px]">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-[9px] w-[9px] rounded-full bg-[var(--color-line)]" />
                ))}
                <span className="ml-auto font-mono-brand text-[10.5px] text-[var(--color-muted)]">{WORK.volta.frameTitle}</span>
              </div>
              <div className="flex flex-col items-stretch justify-between gap-2.5 px-1 py-[18px] sm:flex-row sm:items-center">
                {WORK.volta.flow.map((node, i) => (
                  <div key={node} className="flex flex-col items-center gap-2.5 sm:flex-row">
                    <div className="w-full rounded-[9px] border border-[var(--color-line)] bg-[var(--color-panel-2)] px-[15px] py-[11px] text-center text-xs leading-[1.4] sm:w-auto">
                      {node}
                    </div>
                    {i < WORK.volta.flow.length - 1 && (
                      <span aria-hidden="true" className="rotate-90 text-sm text-[var(--color-cyan)] sm:rotate-0">
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="mb-6 text-[14.5px] leading-[1.7] text-[var(--color-muted)]">{WORK.volta.desc}</p>
            <Pills items={WORK.volta.pills} />
            <Link href={WORK.volta.link.href} className="mt-auto inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--color-cyan)]">
              {WORK.volta.link.label}
            </Link>
          </article>

          <article className="card flex flex-col items-center px-8 py-11 text-center">
            <Tag cyan={false}>{WORK.next.tag}</Tag>
            <h3 className="m-0 mb-3 text-[22px] font-semibold leading-[1.3]">{WORK.next.title}</h3>
            <p className="mb-[26px] max-w-[520px] text-[14.5px] leading-[1.7] text-[var(--color-muted)]">{WORK.next.desc}</p>
            <WhatsAppButton href={WORK.next.cta.href} variant="ghost">
              {WORK.next.cta.label}
            </WhatsAppButton>
          </article>
        </div>

        <div className="mb-[110px] flex flex-col items-start justify-between gap-[18px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-[30px] py-7 md:flex-row md:flex-wrap md:items-center">
          <span className="font-mono-brand text-xs uppercase tracking-[0.08em] text-[var(--color-cyan)]">Build Roadmap</span>
          <div className="flex flex-wrap gap-5 text-[13px] text-[var(--color-muted)]">
            {WORK.roadmap.map((r) => (
              <span key={r.when}>
                <strong className="text-[var(--color-silkscreen)]">{r.when}:</strong> {r.what}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
