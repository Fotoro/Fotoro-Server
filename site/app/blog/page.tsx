import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { posts } from "@/content/blog";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata(
  "Journal",
  "Notes on Fotoro's local photo storage, phone backup and browsing architecture.",
  "/blog"
);
if (posts.length === 0) metadata.robots = { index: false, follow: true };

export default function BlogPage() {
  return <PageShell><div className="container-tight pb-28">
    <header className="pb-12 sm:pb-20">
      <p className="text-xs tracking-[.15em] text-[hsl(var(--brand))]">THE FOTORO JOURNAL</p>
      <h1 className="font-display mt-5 max-w-4xl text-balance text-6xl leading-[.9] sm:text-8xl">Notes from <em>the archive.</em></h1>
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">On photographs, private storage, and the small decisions that shape Fotoro. Written and published with the project source.</p>
    </header>
    {posts.length === 0 ? <div className="grid overflow-hidden rounded-[1.5rem] border border-border bg-card lg:grid-cols-[1.2fr_.8fr]"><div className="relative min-h-[400px] overflow-hidden"><Image src="/editorial/printed-memories.webp" alt="Printed photographs arranged on a table" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div><div className="flex flex-col justify-between p-8 sm:p-12"><p className="text-xs tracking-[.14em] text-[hsl(var(--brand))]">ISSUE 001 · COMING SOON</p><div className="mt-16"><h2 className="font-display text-5xl leading-[.95] sm:text-6xl">The first <em>pages</em> are being written.</h2><p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">The project owner will publish build notes, design decisions, and stories from the archive here. There are no placeholder articles.</p></div></div></div> : null}
    <div className="divide-y divide-border">
      {posts.map((post) => <article key={post.slug} className="grid gap-4 py-10 md:grid-cols-[12rem_1fr_auto] md:gap-8">
        <div className="text-sm text-muted-foreground"><time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time><span className="mt-1 block">{post.readingMinutes} min read</span></div>
        <div><h2 className="font-display text-3xl"><Link href={`/blog/${post.slug}`} className="hover:text-[hsl(var(--brand))]">{post.title}</Link></h2><p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{post.summary}</p></div>
        <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="flex size-10 items-center justify-center border border-border text-foreground hover:border-[hsl(var(--brand))]"><ArrowUpRight className="size-4" /></Link>
      </article>)}
    </div>
  </div></PageShell>;
}
