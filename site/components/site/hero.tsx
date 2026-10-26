import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="container-tight pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Fotoro / self-hosted media</p>
        <h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          Your photos.<br />Your server.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Keep your photo and video library on a Linux machine you control. Browse it by date in the web dashboard, check backup copies, and reach the server through Tailscale.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/download" className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-85">
            Set up the server <ArrowUpRight className="size-4" />
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-accent">
            Open dashboard
          </Link>
        </div>
      </div>
      <div className="mt-20 grid border-y border-border py-6 text-sm sm:grid-cols-3 sm:divide-x sm:divide-border">
        <div className="py-3 sm:pr-8"><span className="font-mono text-xs text-muted-foreground">01 / STORE</span><p className="mt-2">Import files to content-addressed storage.</p></div>
        <div className="py-3 sm:px-8"><span className="font-mono text-xs text-muted-foreground">02 / BACK UP</span><p className="mt-2">Verify a second storage copy before deletion.</p></div>
        <div className="py-3 sm:pl-8"><span className="font-mono text-xs text-muted-foreground">03 / BROWSE</span><p className="mt-2">Scroll the timeline from your browser.</p></div>
      </div>
    </section>
  );
}
