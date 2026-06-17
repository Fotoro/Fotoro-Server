import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    "/",
    "/about",
    "/features",
    "/how-it-works",
    "/pricing",
    "/download",
    "/docs",
    "/login",
  ] as const;

  return pages.map((path, i) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : i === 0 ? 1 : 0.8 - i * 0.05,
  }));
}
