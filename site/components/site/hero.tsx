import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return <section className="container-tight pt-24 sm:pt-28">
    <div className="flex items-center justify-between border-b border-border pb-4">
      <span className="matrix-label">Fotoro / private photo archive</span>
      <span className="hidden text-xs text-muted-foreground sm:block">Linux host · Android backup · Web timeline</span>
    </div>
    <div className="grid min-h-[600px] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col justify-center py-14 pr-0 lg:py-20 lg:pr-16">
        <h1 className="max-w-3xl text-balance text-[clamp(3.5rem,6.5vw,6.5rem)] font-medium leading-[0.98] tracking-[-0.045em]">
          Your photos,<br />on your server
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          Back up originals from your phone, see which copies are verified, and browse the years from a web timeline. The files stay on a Linux host you choose.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/download" className="inline-flex items-center gap-3 bg-[hsl(var(--brand))] px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground">
            Get started <ArrowUpRight className="size-4" />
          </Link>
          <Link href="/features" className="inline-flex items-center gap-3 border border-border px-5 py-3 text-sm font-medium transition-colors hover:border-foreground">
            See what it does
          </Link>
        </div>
      </div>
      <div className="matrix-art my-5 lg:my-8" role="img" aria-label="Abstract halftone print of an archival photo against an orange circle">
        <div className="matrix-art__frame" />
        <div className="absolute bottom-5 left-5 z-10 border border-foreground/50 bg-background/90 px-3 py-2 text-xs">An original stays an original</div>
      </div>
    </div>
    <div className="grid border-y border-border py-5 text-sm text-muted-foreground sm:grid-cols-3">
      <span className="py-2">Originals checked by hash</span><span className="py-2">Backup copies tracked separately</span><span className="py-2">Capture-date timeline</span>
    </div>
  </section>;
}
