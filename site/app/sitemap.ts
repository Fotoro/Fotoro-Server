import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { posts } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/about",
    "/features",
    "/how-it-works",
    "/download",
    "/docs",
    "/blog",
  ] as const;

  return [...pages.map((path, i) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
    changeFrequency: (path === "/" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: path === "/" ? 1 : i === 0 ? 1 : 0.8 - i * 0.05,
  })), ...posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))];
}
