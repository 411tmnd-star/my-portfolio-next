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

const TITLE = `${SITE.owner} | ${SITE.role}`;
const DESCRIPTION =
  "Character rigs, cloth checks, asset pipelines and browser 3D in Python, Blender and Three.js. Five public projects, every number linked to its proof.";
const OG_ALT = `${SITE.owner}, ${SITE.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: SITE.locale,
    url: "/",
    images: [
      {
        url: "/og-card.png",
        type: "image/png",
        width: 1200,
        height: 630,
        alt: OG_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-card.png", alt: OG_ALT }],
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
