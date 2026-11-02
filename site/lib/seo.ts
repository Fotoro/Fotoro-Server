import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

/** Public pages own their canonical and social URL; private pages do not. */
export function publicMetadata(title: string, description: string, path: string): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      type: "website",
      images: [{ url: `${SITE.url}/og.svg`, width: 1200, height: 630, alt: SITE.tagline }],
    },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description },
  };
}
