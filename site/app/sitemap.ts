import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/download`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/docs`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
