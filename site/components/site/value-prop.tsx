import Link from "next/link";
import { ArrowUpRight, HardDrive, Layers3, ScanSearch, ShieldCheck } from "lucide-react";

const capabilities = [
  { number: "01", icon: HardDrive, title: "A place to land", detail: "Import from a folder or send files through a resumable upload. SHA-256 hashes keep originals identifiable and avoid duplicates." },
  { number: "02", icon: ShieldCheck, title: "Copies you can verify", detail: "The server checks primary and backup copies separately. It reports when an upload is complete and when two verified copies exist." },
  { number: "03", icon: Layers3, title: "Years in view", detail: "A date-based timeline, small cached previews, and a gallery that stays responsive as the library grows." },
  { number: "04", icon: ScanSearch, title: "Find the frame", detail: "Search indexed captions and available local search vectors from the same dashboard that shows your storage and queue state." },
];

export function ValueProp() {
  return <section className="container-tight py-28">
    <div className="mb-12 grid items-end gap-6 md:grid-cols-[1fr_1fr]">
      <div><p className="matrix-label">From phone to archive</p><h2 className="mt-5 max-w-lg text-balance text-4xl font-medium leading-[1.05] sm:text-6xl">A place for every original</h2></div>
      <p className="max-w-md text-base leading-relaxed text-muted-foreground md:justify-self-end">Fotoro keeps the useful parts close: files on your storage, clear backup status, and a fast way back to the image you came for.</p>
    </div>
    <div className="grid gap-px border border-border bg-border md:grid-cols-2">
      {capabilities.map(({ number, icon: Icon, title, detail }) => <article key={number} className="relative bg-card p-7 sm:p-10">
        <div className="flex items-start justify-between"><span className="matrix-label">{number}</span><Icon className="size-5 text-muted-foreground" strokeWidth={1.5} /></div>
        <h3 className="mt-14 text-2xl font-medium">{title}</h3>
        <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </article>)}
    </div>
    <Link href="/features" className="mt-8 inline-flex items-center gap-2 border-b border-border pb-2 text-sm text-foreground hover:border-foreground">All features <ArrowUpRight className="size-4" /></Link>
  </section>;
}
