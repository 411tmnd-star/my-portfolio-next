import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The live static site served these paths. Keep every old URL working
  // (and its SEO) after Vercel switches to this project.
  async redirects() {
    return [
      { source: "/voltaedge.html", destination: "/voltaedge", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
