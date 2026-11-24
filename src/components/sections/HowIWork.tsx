import { HOW } from "@/content/site";

export default function HowIWork() {
  return (
    <section id="how" className="how">
      <div className="wrap-wide">
        <span className="section-label">{HOW.eyebrow}</span>
        <h2 className="section-title">{HOW.title}</h2>
        <p className="section-sub">{HOW.sub}</p>
        <div className="how-grid">
          {HOW.items.map((item) => (
            <article key={item.title} className="how-item">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <a href={item.link.href} target="_blank" rel="noopener">
                {item.link.label}
                <span className="sr-only">: {item.title}</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
