import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = publicMetadata("How it works", "From local media to a searchable, backed-up Fotoro timeline.", "/how-it-works");

const steps = [
  { number: "01", title: "Give it a home", text: "Build Fotoro on a Linux host, run setup, and choose primary storage. Connect a separate backup target if you have one.", line: "Linux host → local library" },
  { number: "02", title: "Bring your images in", text: "Import an existing folder or upload through the web dashboard. The server hashes each original and can resume an interrupted upload.", line: "Source → verified original" },
  { number: "03", title: "Make another copy", text: "The backup worker checks what still needs a second copy. The dashboard shows verified, pending and failed items.", line: "Primary → backup target" },
  { number: "04", title: "Open the timeline", text: "Sign in, reach your linked server over its private route, and browse date-grouped previews. Open an original only when you need it.", line: "Your server → your screen" },
];

export default function HowItWorksPage() {
  return <PageShell><div className="container-tight pb-28">
    <div className="grid gap-8 border-b border-border pb-14 lg:grid-cols-[1fr_0.55fr]"><div><p className="matrix-label">From source to screen</p><h1 className="mt-5 max-w-3xl text-balance text-5xl font-medium leading-[1.02] sm:text-7xl">A path for every original</h1></div><p className="self-end text-base leading-relaxed text-muted-foreground">Fotoro keeps ingest, storage, verification and browsing visible. The archive lives on the machine you choose.</p></div>
    <div className="grid gap-px border-x border-b border-border bg-border md:grid-cols-2">{steps.map((step) => <section key={step.number} className="relative min-h-80 bg-card p-8 sm:p-10"><span className="matrix-label">Step {step.number}</span><ArrowDownRight className="absolute right-7 top-7 size-6 text-muted-foreground" strokeWidth={1.5} /><h2 className="relative mt-20 text-3xl font-medium">{step.title}</h2><p className="relative mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{step.text}</p><p className="relative mt-8 border-t border-border pt-4 text-xs text-muted-foreground">{step.line}</p></section>)}</div>
    <div className="matrix-paper mt-12 flex flex-wrap items-center justify-between gap-6 p-8"><p className="max-w-xl text-2xl font-medium">Start with a host you control. Add your phone when you are ready.</p><Link href="/download" className="inline-flex items-center gap-2 border-b border-background pb-1 text-sm font-medium">Get started <ArrowUpRight className="size-4" /></Link></div>
  </div></PageShell>;
}
