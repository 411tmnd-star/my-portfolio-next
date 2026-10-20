type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  small?: boolean;
  className?: string;
};

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-[17px] w-[17px] flex-none fill-current">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.4A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-2.5.7.7-2.4-.2-.3A8 8 0 0 1 12 4zm-3.4 4c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4l-.6-.3-1.6-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.3-1.6-1.5-1.8-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4z" />
    </svg>
  );
}

/** Every conversion on the site is one WhatsApp message with prefilled text. */
export default function WhatsAppButton({ href, children, variant = "primary", small, className = "" }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${small ? "btn-small" : ""} ${className}`}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}
