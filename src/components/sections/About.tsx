import { ABOUT } from "@/content/site";

/** Renders **bold** spans from the content file without pulling in markdown. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="text-[var(--color-silkscreen)]">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function About() {
  return (
    <section id="about">
      <div className="wrap">
        <span className="section-label">{ABOUT.label}</span>
        <h2 className="section-title">{ABOUT.title}</h2>
        <div className="mb-[110px] max-w-[660px] text-[15px] text-[var(--color-muted)]">
          {ABOUT.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mb-4">
              <Rich text={p} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
