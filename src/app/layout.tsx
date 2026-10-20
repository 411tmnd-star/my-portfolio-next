import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/content/site";
import "./globals.css";

/* Self-hosted from src/app/fonts (OFL-1.1). No build-time fetch from Google,
   no runtime CDN request, no layout shift. */
const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-latin-wght.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-latin-wght.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
});

const TITLE = "411 — Localized AI, Web & Connected Hardware | Michael Ikhine";
const DESCRIPTION =
  "411 is an ecosystem of web applications, UI/UX design, and connected IoT hardware engineered in Nigeria by Michael Ikhine, with localized AI systems in active development.";
const SOCIAL_DESCRIPTION =
  "Web applications, UI/UX design, and embedded IoT hardware engineered in Nigeria — with localized AI systems in development.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    siteName: SITE.name,
    title: "411 Ecosystem — AI, Web & Connected Hardware | Michael Ikhine",
    description: SOCIAL_DESCRIPTION,
    type: "website",
    locale: SITE.locale,
    url: "/",
    images: [
      {
        url: "/og-card.png",
        type: "image/png",
        width: 1200,
        height: 630,
        alt: "411 Ecosystem — AI, UI/UX, and Connected Hardware by Michael Ikhine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "411 Ecosystem — AI, Web & Connected Hardware",
    description: SOCIAL_DESCRIPTION,
    images: [{ url: "/og-card.png", alt: "411 Ecosystem — AI, UI/UX, and Connected Hardware by Michael Ikhine" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0E12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
