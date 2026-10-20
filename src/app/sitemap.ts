import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE.url}/voltaedge`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
