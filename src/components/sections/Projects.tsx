import { READY_PROJECTS } from "@/content/projects";
import ProjectMedia from "./ProjectMedia";

export default function Projects() {
  return (
    <section id="projects" className="projects">
      <div className="wrap-wide">
        <span className="section-label">Projects</span>
        <h2 className="section-title">Five projects, every number linked to its proof</h2>
        {READY_PROJECTS.map((p) => (
          <article key={p.id} id={`project-${p.id}`} className="project" aria-labelledby={`${p.id}-title`}>
            <ProjectMedia media={p.media} />
            <div className="project-copy">
              <h3 id={`${p.id}-title`}>{p.title}</h3>
              <p className="project-role">{p.role}</p>
              <p className="project-summary">{p.summary}</p>
              <dl className="metrics">
                {p.metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd>
                      <a href={m.proofUrl} target="_blank" rel="noopener" data-metric aria-label={`${m.value}, ${m.label}: open the proof`}>
                        {m.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="project-status">
                <span className={p.status === "Public" ? "chip chip-live" : "chip chip-plan"}>{p.status}</span>
                <span className="project-commit">commit {p.commit}</span>
              </p>
              <p className="project-links">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener" className="btn btn-ghost btn-small">
                    {l.label}
                    <span className="sr-only">: {p.title}</span>
                  </a>
                ))}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
