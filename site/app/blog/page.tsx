import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { posts } from "@/content/blog";
import { publicMetadata } from "@/lib/seo";

const categories = [
  { id: "archive", n: "01", title: "The archive", description: "Preserving photographs and finding your way back to them." },
  { id: "building", n: "02", title: "Building Fotoro", description: "Engineering notes, architecture and design decisions." },
  { id: "ownership", n: "03", title: "Privacy & ownership", description: "Personal infrastructure, data ownership and access." },
  { id: "photography", n: "04", title: "Photography", description: "Thoughts on photographs, memory, time and looking." },
  { id: "releases", n: "05", title: "Release notes", description: "Product changes and improvements, as they ship." },
] as const;

export const metadata: Metadata = publicMetadata("Journal", "Notes on photographs, private storage, preservation and the decisions that shape Fotoro.", "/blog");
if (posts.length === 0) metadata.robots = { index: false, follow: true };

function dateLabel(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default function BlogPage() {
  return <PageShell mainClassName="journal-shell"><div className="journal-page">
    <header className="journal-hero">
      <div className="journal-hero__copy"><p className="eyebrow">FOTORO / JOURNAL</p><h1 className="font-display">Notes from<br /><em>the archive.</em></h1><p>On photographs, private storage, preservation, and the small decisions that shape Fotoro.</p><span className="journal-hero__issue">EDITORIAL INDEX / 001</span></div>
      <figure className="journal-hero__image"><Image src="/images/editorial/printed-memories.jpg" alt="A camera and printed photographs resting on an open book" fill priority sizes="(max-width: 760px) 100vw, 53vw" quality={82} /><figcaption><span>ON KEEPING / 01</span><span>FOTORO JOURNAL</span></figcaption></figure>
      <span className="journal-hero__folio" aria-hidden="true">J—001</span>
    </header>

    <section className="journal-taxonomy" aria-labelledby="journal-categories-title">
      <div className="journal-section-head"><div><span className="chapter-index">EDITORIAL THREADS</span><h2 id="journal-categories-title" className="font-heading">What we write <em>about.</em></h2></div><p>Topics we return to as the product and its archive grow.</p></div>
      <div className="journal-category-list">{categories.map((category) => {
        const categoryPosts = posts.filter((post) => (post.category ?? "building") === category.id);
        return <section className="journal-category" id={`journal-${category.id}`} key={category.id}>
          <div className="journal-category__index">{category.n}</div><div className="journal-category__intro"><h3 className="font-heading">{category.title}</h3><p>{category.description}</p></div>
          <div className="journal-category__entries">{categoryPosts.length ? categoryPosts.map((post) => <article key={post.slug} className="journal-entry"><div><span>{dateLabel(post.publishedAt)} / {post.readingMinutes} MIN READ</span><h4><Link href={`/blog/${post.slug}`}>{post.title}<ArrowUpRight size={14} /></Link></h4><p>{post.summary}</p></div></article>) : <p className="journal-empty">No published entries in this thread yet.</p>}</div>
        </section>;
      })}</div>
    </section>

    <aside className="journal-note"><span>EDITOR’S NOTE / 001</span><div><h2 className="font-display">No borrowed stories.</h2><p>Only articles published from the project source appear here. The categories above are editorial threads, not placeholder posts.</p></div><span className="journal-note__mark">f.</span></aside>
  </div></PageShell>;
}
