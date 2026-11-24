import Link from "next/link";
import { CONTACT, SITE } from "@/content/site";

export default function Contact() {
  return (
    <>
      <section id="contact" className="contact">
        <div className="wrap-wide">
          <h2 className="section-title">{CONTACT.title}</h2>
          <p className="section-sub">{CONTACT.sub}</p>
          <p className="contact-links">
            <a href={`mailto:${SITE.email}`} className="btn btn-primary">{SITE.email}</a>
            <a href={SITE.github} target="_blank" rel="noopener" className="btn btn-ghost">github.com/411tmnd-star</a>
          </p>
        </div>
      </section>
      <footer className="footer">
        <span>{CONTACT.footer}</span>
        <Link href={CONTACT.earlier.href}>{CONTACT.earlier.label}</Link>
      </footer>
    </>
  );
}
