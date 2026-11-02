import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { posts } from "@/content/blog";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata(
  "Journal",
  "Notes on Fotoro's local photo storage, phone backup and browsing architecture.",
  "/blog"
);

export default function BlogPage() {
  return <PageShell><div className="container-tight pb-28">
    <header className="border-b border-border pb-12">
      <p className="matrix-label">From the project</p>
      <h1 className="mt-5 max-w-3xl text-5xl font-medium sm:text-7xl">Notes from the archive</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">How the system handles originals, backups and access. Written and published with the Fotoro source.</p>
    </header>
    <div className="divide-y divide-border">
      {posts.map((post) => <article key={post.slug} className="grid gap-4 py-10 md:grid-cols-[12rem_1fr_auto] md:gap-8">
        <div className="text-sm text-muted-foreground"><time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time><span className="mt-1 block">{post.readingMinutes} min read</span></div>
        <div><h2 className="text-2xl font-medium"><Link href={`/blog/${post.slug}`} className="hover:text-[hsl(var(--brand))]">{post.title}</Link></h2><p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{post.summary}</p></div>
        <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="flex size-10 items-center justify-center border border-border text-foreground hover:border-[hsl(var(--brand))]"><ArrowUpRight className="size-4" /></Link>
      </article>)}
    </div>
  </div></PageShell>;
}
