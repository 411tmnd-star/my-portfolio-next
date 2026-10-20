import { CONTACT, SITE } from "@/content/site";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

export default function Contact() {
  return (
    <>
      <section id="contact">
        <div className="wrap">
          <div className="mb-[100px] rounded-[22px] border border-[var(--color-line)] bg-[var(--color-panel)] px-[6vw] py-16 text-center">
            <h2 className="m-0 mb-3.5 text-[30px] font-bold">{CONTACT.title}</h2>
            <p className="mx-auto mb-8 max-w-[500px] text-[15px] leading-[1.6] text-[var(--color-muted)]">{CONTACT.sub}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <WhatsAppButton href={CONTACT.cta.href}>{CONTACT.cta.label}</WhatsAppButton>
            </div>
            <p className="mt-[22px] font-mono-brand text-xs leading-[1.9] text-[var(--color-muted)]">
              Prefer email?{" "}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-[3px] hover:text-[var(--color-cyan)]">
                {SITE.email}
              </a>
              <br />
              Code:{" "}
              <a href={SITE.github} target="_blank" rel="noopener" className="underline underline-offset-[3px] hover:text-[var(--color-cyan)]">
                github.com/411tmnd-star
              </a>
            </p>
          </div>
        </div>
      </section>
      <footer className="border-t border-[var(--color-line)] px-[6vw] py-7 text-center font-mono-brand text-[11.5px] text-[var(--color-muted)]">
        {CONTACT.footer}
      </footer>
    </>
  );
}
