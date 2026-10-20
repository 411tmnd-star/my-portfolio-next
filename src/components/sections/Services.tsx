import { SERVICES, wa } from "@/content/site";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

/** §3 Services — price is the headline, not a footnote. Every card ends in one action. */
export default function Services() {
  return (
    <section id="services">
      <div className="wrap">
        <span className="section-label">{SERVICES.label}</span>
        <h2 className="section-title">{SERVICES.title}</h2>
        <p className="section-sub">{SERVICES.sub}</p>

        <div className="mb-[22px] grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(290px,100%),1fr))]">
          {SERVICES.items.map((s) => (
            <div
              key={s.name}
              className="flex flex-col rounded-[14px] border border-[var(--color-line)] bg-[var(--color-panel-2)] px-[26px] py-7 transition hover:-translate-y-[3px] hover:border-[rgb(53_224_242/0.3)]"
            >
              <h3 className="m-0 mb-3.5 text-[17px] font-semibold">{s.name}</h3>
              <div className="font-mono-brand text-[25px] font-semibold leading-[1.1] tracking-tight text-[var(--color-cyan)]">
                <span className="mb-[5px] block text-[10.5px] font-normal uppercase tracking-[0.13em] text-[var(--color-muted)]">
                  {s.priceLabel}
                </span>
                {s.price}
                {s.per && <span className="text-[13px] text-[var(--color-muted)]">{s.per}</span>}
              </div>
              <p className="mt-4 text-[13.5px] leading-[1.65] text-[var(--color-muted)]">{s.desc}</p>
              <ul className="mb-auto mt-4 list-none border-t border-[var(--color-line)] p-0 pt-[15px]">
                {s.includes.map((item) => (
                  <li key={item} className="relative pb-2 pl-[18px] text-[13px] leading-[1.5] text-[var(--color-muted)]">
                    <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-[rgb(53_224_242/0.55)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-3.5 flex flex-wrap gap-[7px]">
                {s.terms.map((t) => (
                  <span
                    key={t}
                    className="whitespace-nowrap rounded-md border border-[rgb(184_115_51/0.3)] bg-[rgb(184_115_51/0.08)] px-2.5 py-[5px] font-mono-brand text-[10.5px] tracking-[0.06em] text-[var(--color-copper-highlight)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <WhatsAppButton href={wa(s.waText)} small className="mt-[22px] self-start">
                Start on WhatsApp
              </WhatsAppButton>
            </div>
          ))}
        </div>
        <span className="mb-[110px] block text-left font-mono-brand text-xs text-[var(--color-muted)] md:text-right">
          {SERVICES.disclaimer}
        </span>
      </div>
    </section>
  );
}
