import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { posts } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/about",
    "/features",
    "/how-it-works",
    "/security",
    "/download",
    "/docs",
  ] as const;

  return [...pages.map((path) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
  })), ...(posts.length > 0 ? [{ url: `${SITE.url}/blog` }] : []), ...posts.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }))];
}
