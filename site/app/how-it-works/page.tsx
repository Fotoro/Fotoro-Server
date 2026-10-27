import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = { title: "How it works", description: "From local media to a searchable, backed-up Fotoro timeline." };

const steps = [
  { number: "01", title: "Give it a home", text: "Build Fotoro on a Linux host, run setup, and choose primary storage. Connect a separate backup target if you have one.", line: "Linux host → local library" },
  { number: "02", title: "Bring your images in", text: "Import an existing folder or upload through the web dashboard. The server hashes each original and can resume an interrupted upload.", line: "Source → verified original" },
  { number: "03", title: "Make another copy", text: "The backup worker checks what still needs a second copy. The dashboard shows verified, pending and failed items.", line: "Primary → backup target" },
  { number: "04", title: "Open the timeline", text: "Sign in, reach your linked server over its private route, and browse date-grouped previews. Open an original only when you need it.", line: "Your server → your screen" },
];

export default function HowItWorksPage() {
  return <PageShell><div className="container-tight pb-28">
    <div className="grid gap-8 border-b border-border pb-14 lg:grid-cols-[1fr_0.55fr]"><div><p className="matrix-label">The path / source to screen</p><h1 className="mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">A clear route for every image.</h1></div><p className="self-end text-base leading-relaxed text-muted-foreground">Fotoro keeps each step visible: ingest, store, verify, and browse. The archive lives on the machine you choose.</p></div>
    <div className="grid gap-px border-x border-b border-border bg-border md:grid-cols-2">{steps.map((step) => <section key={step.number} className="relative min-h-80 overflow-hidden bg-card p-8 sm:p-10"><span className="matrix-label">Step / {step.number}</span><ArrowDownRight className="absolute right-7 top-7 size-8 text-[hsl(var(--brand))]" strokeWidth={1} /><div className="absolute -right-14 bottom-0 size-48 bg-dot-grid opacity-45" /><h2 className="relative mt-20 text-3xl font-semibold tracking-tight">{step.title}</h2><p className="relative mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{step.text}</p><p className="relative mt-8 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-wider text-[hsl(var(--brand))]">{step.line}</p></section>)}</div>
    <div className="matrix-paper mt-12 flex flex-wrap items-center justify-between gap-6 p-8"><p className="max-w-xl text-2xl font-semibold tracking-tight">Start with a host you control. Add the rest as your collection grows.</p><Link href="/download" className="inline-flex items-center gap-2 border-b border-background pb-1 font-mono text-xs font-bold uppercase tracking-wider">Setup guide <ArrowUpRight className="size-4" /></Link></div>
  </div></PageShell>;
}
