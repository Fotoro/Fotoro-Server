import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = { title: "Features", description: "A direct look at Fotoro's current server and web features." };

const features = [
  ["Ingestion", "Resumable uploads, SHA-256 duplicate detection, and import from the host filesystem."],
  ["Storage", "Originals are stored by content hash. The server generates small and medium previews for browsing."],
  ["Backup checks", "Primary and backup copies are recorded separately. Deletion safety requires two verified copies on available storage."],
  ["Web timeline", "Browse by capture date. The gallery loads pages and renders only the rows around the viewport."],
  ["Private access", "The web dashboard uses your sign-in and linked server endpoint to reach your own machine."],
];

export default function FeaturesPage() {
  return <PageShell><div className="container-tight max-w-4xl pb-28">
    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Current capabilities</p>
    <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">What Fotoro can do today</h1>
    <div className="mt-12 border-t border-border">{features.map(([title, detail], index) => <section key={title} className="grid gap-2 border-b border-border py-7 sm:grid-cols-[3rem_12rem_1fr]"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><h2 className="font-medium">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{detail}</p></section>)}</div>
    <p className="mt-10 text-sm text-muted-foreground">The Android client and packaged installers are in development. Test offloading today with the host import flow or upload API.</p>
  </div></PageShell>;
}
