import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = publicMetadata("About", "Fotoro is an open-source photo archive built around local storage and clear ownership.", "/about");

export default function AboutPage() {
  return <PageShell><div className="container-tight pb-28">
    <div className="grid overflow-hidden rounded-[1.5rem] border border-border bg-card lg:grid-cols-[1fr_1fr]"><div className="flex flex-col justify-between p-8 sm:p-12 lg:py-20"><p className="text-xs tracking-[.14em] text-[hsl(var(--brand))]">A NOTE FROM THE PROJECT</p><div className="mt-16"><h1 className="font-display text-balance text-6xl leading-[.9] sm:text-8xl">Good pictures deserve <em>a good home.</em></h1><p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground">Fotoro is a private archive for the images and videos that accumulate across devices and years. Preserve the originals, see where copies are, and find the moments again.</p></div></div><div className="relative min-h-[400px]"><Image src="/editorial/printed-memories.webp" alt="A small collection of printed photographs" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div></div>
    <div className="mt-20 grid gap-10 border-y border-border py-12 md:grid-cols-3">
      <div><span className="font-display text-3xl italic text-[hsl(var(--brand))]">01</span><h2 className="mt-5 text-xl font-medium">Storage you choose.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Run the server on a Linux machine and keep media on your own drives.</p></div>
      <div><span className="font-display text-3xl italic text-[hsl(var(--brand))]">02</span><h2 className="mt-5 text-xl font-medium">Clear copy status.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">See what reached the host and what has an independently verified backup.</p></div>
      <div><span className="font-display text-3xl italic text-[hsl(var(--brand))]">03</span><h2 className="mt-5 text-xl font-medium">Source you can inspect.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">The Linux server and website are developed in public repositories.</p></div>
    </div>
    <div className="mt-16 grid gap-6 rounded-[1.5rem] bg-card p-8 sm:grid-cols-[1fr_auto] sm:p-12"><div><p className="text-sm text-[hsl(var(--brand))]">Built in public</p><h2 className="font-display mt-5 max-w-xl text-5xl">The archive is taking shape.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">The Linux server, web dashboard and Android v0.1 app are available. The source and design decisions are open to inspect.</p></div><div className="flex flex-col items-start justify-end gap-3 text-sm font-medium"><Link href="https://github.com/Fotoro/Fotoro-Model" className="inline-flex items-center gap-1 border-b border-foreground pb-1">Server source <ArrowUpRight className="size-4" /></Link><Link href="https://github.com/Fotoro/Fotoro-Android" className="inline-flex items-center gap-1 border-b border-foreground pb-1">Android source <ArrowUpRight className="size-4" /></Link></div></div>
  </div></PageShell>;
}
