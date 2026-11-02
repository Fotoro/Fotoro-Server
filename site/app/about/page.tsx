import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = publicMetadata("About", "Fotoro is an open-source photo archive built around local storage and clear ownership.", "/about");

export default function AboutPage() {
  return <PageShell><div className="container-tight pb-28">
    <div className="grid gap-8 border-b border-border pb-16 lg:grid-cols-[1fr_0.7fr]"><div><p className="matrix-label">A note from the project</p><h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">Good pictures deserve a good home.</h1></div><div className="flex flex-col justify-end gap-5 text-base leading-relaxed text-muted-foreground"><p>Fotoro is a self-hosted archive for the images and videos that accumulate across devices and years.</p><p>The work is practical: preserve originals, show where copies are, and make the library easy to navigate.</p></div></div>
    <div className="grid gap-px border-x border-b border-border bg-border md:grid-cols-3">
      <div className="bg-card p-8"><span className="matrix-label">01 / Local</span><h2 className="mt-16 text-2xl font-semibold">Storage you choose.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Run the server on a Linux machine and keep the media on your own drives.</p></div>
      <div className="bg-card p-8"><span className="matrix-label">02 / Legible</span><h2 className="mt-16 text-2xl font-semibold">Clear copy status.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">See what reached the host and what has an independently verified backup.</p></div>
      <div className="bg-card p-8"><span className="matrix-label">03 / Open</span><h2 className="mt-16 text-2xl font-semibold">Source you can inspect.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The Linux server and website are developed in public source repositories.</p></div>
    </div>
    <div className="matrix-signal mt-12 grid gap-6 p-8 sm:grid-cols-[1fr_auto] sm:p-12"><div><p className="text-sm font-medium">Built in public</p><h2 className="mt-5 max-w-xl text-3xl font-medium">The archive is taking shape</h2><p className="mt-3 max-w-lg text-sm leading-relaxed">The Linux server, web dashboard and Android v0.1 app are available. The source and design decisions are open to inspect.</p></div><div className="flex flex-col items-start justify-end gap-3 text-sm font-medium"><Link href="https://github.com/Fotoro/Fotoro-Model" className="inline-flex items-center gap-1 border-b border-background pb-1">Server source <ArrowUpRight className="size-4" /></Link><Link href="https://github.com/Fotoro/Fotoro-Android" className="inline-flex items-center gap-1 border-b border-background pb-1">Android source <ArrowUpRight className="size-4" /></Link></div></div>
  </div></PageShell>;
}
