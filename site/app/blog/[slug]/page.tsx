import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { Markdown } from "@/components/markdown";
import { getPost, posts } from "@/content/blog";
import { SITE } from "@/lib/constants";
import { publicMetadata } from "@/lib/seo";

type BlogParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { robots: { index: false } };
  return {
    ...publicMetadata(post.title, post.summary, `/blog/${post.slug}`),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `${SITE.url}/blog/${post.slug}`,
      siteName: SITE.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: `${SITE.url}/og.svg`, width: 1200, height: 630, alt: SITE.tagline }],
    },
  };
}

export default async function BlogPostPage({ params }: BlogParams) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: "Fotoro" },
    publisher: { "@type": "Organization", name: "Fotoro" },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };
  return <PageShell><article className="container-tight max-w-4xl pb-28">
    <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Journal</Link>
    <header className="mt-10 border-b border-border pb-10">
      <p className="text-sm text-muted-foreground"><time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time> · {post.readingMinutes} min read</p>
      <h1 className="font-display mt-5 text-balance text-6xl leading-[.95] sm:text-8xl">{post.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{post.summary}</p>
    </header>
    <div className="mx-auto max-w-2xl pt-14">
      <Markdown source={post.body} />
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
  </article></PageShell>;
}
