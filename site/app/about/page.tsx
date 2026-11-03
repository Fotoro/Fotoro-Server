import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata("About", "Fotoro is an open-source photo archive built around local storage and clear ownership.", "/about");

export default function AboutPage() {
  return <PageShell mainClassName="about-shell"><div className="about-page">
    <header className="about-hero">
      <div className="about-hero__copy"><p className="eyebrow">A NOTE FROM THE PROJECT / 01</p><h1 className="font-display">Good pictures<br />deserve <em>a good home.</em></h1><p>Fotoro is a private archive for the photographs and videos that gather across devices and years. Keep the originals on hardware you choose, understand their copy state, and find the moments again.</p><Link href="/features" className="text-link">Explore what Fotoro does <ArrowUpRight size={15} /></Link></div>
      <figure className="about-hero__image"><Image src="/images/editorial/friends-memory.jpg" alt="Friends spending a quiet afternoon together outside" fill priority sizes="(max-width: 760px) 100vw, 50vw" quality={82} /><figcaption><span>MEMORY / IN ITS OWN TIME</span><span>FOTORO / ABOUT</span></figcaption></figure>
    </header>
    <section className="about-beliefs" aria-label="Fotoro principles">
      <article><span>01 / OWNERSHIP</span><h2 className="font-heading">The storage is yours to choose.</h2><p>Run the server on a Linux machine and keep media on your configured drives.</p></article>
      <article><span>02 / PRESERVATION</span><h2 className="font-heading">Copies have visible states.</h2><p>See what reached the host and what has a separately verified backup.</p></article>
      <article><span>03 / OPEN SOURCE</span><h2 className="font-heading">The implementation is inspectable.</h2><p>The server and Android app are developed in public repositories.</p></article>
    </section>
    <aside className="about-build"><div><span>BUILT IN PUBLIC / PROJECT STATUS</span><h2 className="font-display">The archive is<br /><em>taking shape.</em></h2><p>The Linux server, website and Android v0.1 app are available. The source and design decisions are open to inspect.</p></div><div className="about-build__links"><Link href="https://github.com/Fotoro/Fotoro-Model">Server source <ArrowUpRight size={14} /></Link><Link href="https://github.com/Fotoro/Fotoro-Android">Android source <ArrowUpRight size={14} /></Link></div></aside>
  </div></PageShell>;
}
