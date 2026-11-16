import fs from "node:fs";
import path from "node:path";

/**
 * The project owner publishes journal posts by committing markdown files to
 * `content/posts/`. No visitor, dashboard account or API route can create a
 * post. Each file carries a small frontmatter block:
 *
 *   ---
 *   slug: my-post            (optional; defaults to the filename without a NN- prefix)
 *   title: "My post"         (optional; defaults to the first # heading)
 *   summary: "One line."
 *   publishedAt: 2026-11-16
 *   updatedAt: 2026-11-16    (optional)
 *   category: building       (archive | building | ownership | photography | releases)
 *   order: 1                 (optional; tie-breaks posts sharing a date)
 *   ---
 */

export type BlogCategory = "archive" | "building" | "ownership" | "photography" | "releases";

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  category?: BlogCategory;
  order?: number;
  body: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const WORDS_PER_MINUTE = 200;

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    meta[key] = line.slice(idx + 1).trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
  return { meta, body: raw.slice(match[0].length) };
}

function slugFromFile(file: string): string {
  return file.replace(/\.md$/, "").replace(/^\d+-/, "");
}

/** Rewrite `01-foo.md` cross-links between posts into `/blog/<slug>` routes. */
function rewritePostLinks(body: string, fileToSlug: Map<string, string>): string {
  return body.replace(
    /\]\(([a-z0-9-]+)\.md\)/g,
    (_m, file) => `](/blog/${fileToSlug.get(file) ?? file.replace(/^\d+-/, "")})`,
  );
}

function loadPosts(): BlogPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith(".md"));
  const parsed = files.map((file) => ({
    file,
    ...parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8")),
  }));
  const fileToSlug = new Map(
    parsed.map(({ file, meta }) => [file.replace(/\.md$/, ""), meta.slug || slugFromFile(file)]),
  );
  return parsed.map(({ file, meta, body }) => {
    const heading = /^#\s+(.+)$/m.exec(body)?.[1]?.trim();
    const publishedAt = meta.publishedAt ?? meta.date ?? "1970-01-01";
    const order = meta.order !== undefined ? Number(meta.order) : undefined;
    const clean = body.replace(/^#\s+.+$/m, "").trim();
    return {
      slug: meta.slug || slugFromFile(file),
      title: meta.title || heading || slugFromFile(file),
      summary: meta.summary || "",
      publishedAt,
      updatedAt: meta.updatedAt || publishedAt,
      readingMinutes: Math.max(1, Math.round(clean.split(/\s+/).length / WORDS_PER_MINUTE)),
      category: meta.category as BlogCategory | undefined,
      order: Number.isFinite(order) ? order : undefined,
      body: rewritePostLinks(clean, fileToSlug),
    };
  });
}

export const posts: BlogPost[] = loadPosts().sort(
  (a, b) =>
    b.publishedAt.localeCompare(a.publishedAt) ||
    (a.order ?? 999) - (b.order ?? 999) ||
    a.slug.localeCompare(b.slug),
);

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
