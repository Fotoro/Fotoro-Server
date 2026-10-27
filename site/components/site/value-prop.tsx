import Link from "next/link";
import { ArrowUpRight, HardDrive, Layers3, ScanSearch, ShieldCheck } from "lucide-react";

const capabilities = [
  { number: "01", icon: HardDrive, title: "A place to land", detail: "Import from a folder or send files through a resumable upload. SHA-256 hashes keep originals identifiable and avoid duplicates." },
  { number: "02", icon: ShieldCheck, title: "Copies you can verify", detail: "The server checks primary and backup copies separately. It reports when an offload is complete and when the original is safe to remove." },
  { number: "03", icon: Layers3, title: "Years in view", detail: "A date-based timeline, small cached previews, and a gallery that stays responsive as the library grows." },
  { number: "04", icon: ScanSearch, title: "Find the frame", detail: "Search indexed captions and available local search vectors from the same dashboard that shows your storage and queue state." },
];

export function ValueProp() {
  return <section className="container-tight py-28">
    <div className="mb-12 grid items-end gap-6 md:grid-cols-[1fr_1fr]">
      <div><p className="matrix-label">Built for the long roll</p><h2 className="mt-5 max-w-lg text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">More archive.<br /><span className="text-[hsl(var(--brand))]">Less friction.</span></h2></div>
      <p className="max-w-md text-base leading-relaxed text-muted-foreground md:justify-self-end">Fotoro keeps the useful parts close: files on your storage, clear backup status, and a fast way back to the image you came for.</p>
    </div>
    <div className="grid gap-px border border-border bg-border md:grid-cols-2">
      {capabilities.map(({ number, icon: Icon, title, detail }) => <article key={number} className="group relative overflow-hidden bg-card p-7 sm:p-10">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-dot-grid opacity-45 transition group-hover:opacity-100" />
        <div className="relative flex items-start justify-between"><span className="matrix-label">/ {number}</span><Icon className="size-6 text-[hsl(var(--brand))]" strokeWidth={1.5} /></div>
        <h3 className="relative mt-20 text-2xl font-medium tracking-tight">{title}</h3>
        <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </article>)}
    </div>
    <Link href="/features" className="mt-8 inline-flex items-center gap-2 border-b border-[hsl(var(--brand))] pb-2 font-mono text-xs uppercase tracking-widest text-[hsl(var(--brand))]">See every feature <ArrowUpRight className="size-4" /></Link>
  </section>;
}
