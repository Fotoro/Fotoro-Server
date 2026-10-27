import Link from "next/link";
import { ArrowUpRight, MoveDownRight } from "lucide-react";

export function Hero() {
  return <section className="container-tight pt-24 sm:pt-28">
    <div className="flex items-center justify-between border-b border-border pb-4">
      <span className="matrix-label">An archive on your terms</span>
      <span className="hidden font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:block">Independent storage / connected life</span>
    </div>
    <div className="grid min-h-[660px] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col justify-center py-14 pr-0 lg:py-20 lg:pr-16">
        <div className="mb-7 flex items-center gap-3"><span className="size-2 rounded-full bg-[hsl(var(--brand))]" /><span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Photographs belong somewhere real</span></div>
        <h1 className="max-w-3xl text-balance text-[clamp(4rem,7vw,7.4rem)] font-semibold leading-[0.92] tracking-[-0.075em]">
          Keep the<br /><span className="text-[hsl(var(--brand))]">whole</span><br />picture.
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          A home for your photos and videos, on your own Linux server. Offload originals, verify backups, and find your way through the years from any connected screen.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/download" className="inline-flex items-center gap-3 bg-[hsl(var(--brand))] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-background transition hover:brightness-110">
            Set up Fotoro <ArrowUpRight className="size-4" />
          </Link>
          <Link href="/features" className="inline-flex items-center gap-3 border border-border px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest transition hover:border-[hsl(var(--brand))]">
            Explore features <MoveDownRight className="size-4" />
          </Link>
        </div>
        <div className="mt-16 grid max-w-md grid-cols-3 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>01 / Import</span><span>02 / Protect</span><span>03 / Explore</span>
        </div>
      </div>
      <div className="matrix-art my-5 lg:my-8" role="img" aria-label="Abstract halftone print of an archival photo against an orange circle">
        <div className="matrix-art__frame" />
        <div className="absolute bottom-5 left-5 z-10 border border-foreground/50 bg-background/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em]">Your archive / your machine</div>
        <div className="absolute right-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">FT—01<br />Digital keepsake</div>
      </div>
    </div>
    <div className="grid border-y border-border py-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:grid-cols-3">
      <span className="py-2">Content-addressed originals</span><span className="py-2">Verified second copies</span><span className="py-2">Private web timeline</span>
    </div>
  </section>;
}
