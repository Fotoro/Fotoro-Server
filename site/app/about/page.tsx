import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = { title: "About", description: "Fotoro is an open-source, self-hosted photo archive in active development." };

export default function AboutPage() {
  return <PageShell><div className="container-tight max-w-3xl pb-28">
    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">About Fotoro</p>
    <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A photo archive you can run yourself.</h1>
    <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
      <p>Fotoro is an open-source project for keeping photos and videos on your own Linux machine. It combines a local media server with a web dashboard for viewing the timeline and checking storage status.</p>
      <p>The project is in active development. The server and web dashboard are available in source form. An Android client and packaged releases are planned.</p>
      <p>We publish the source so you can inspect the storage and access paths, run the software on your hardware, and contribute fixes.</p>
    </div>
    <div className="mt-10 flex flex-wrap gap-6 text-sm"><Link className="border-b border-foreground pb-1" href="https://github.com/Fotoro/Fotoro-Model">Server source ↗</Link><Link className="border-b border-foreground pb-1" href="https://github.com/Fotoro/Fotoro-Server">Web source ↗</Link></div>
  </div></PageShell>;
}
