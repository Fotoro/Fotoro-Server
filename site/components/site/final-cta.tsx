import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCTA() {
  return <section className="container-tight pb-28">
    <div className="matrix-signal relative overflow-hidden px-7 py-12 sm:px-12 sm:py-16">
      <p className="relative text-sm font-medium">Your storage, your decisions</p>
      <div className="relative mt-7 flex flex-wrap items-end justify-between gap-8">
        <h2 className="max-w-2xl text-balance text-5xl font-medium leading-[1.02] sm:text-6xl">Give the archive a home</h2>
        <Link href="/download" className="inline-flex items-center gap-3 border border-background bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-transparent hover:text-background">Set up Fotoro <ArrowUpRight className="size-4" /></Link>
      </div>
      <p className="relative mt-8 max-w-lg text-sm leading-relaxed">The Linux server, web dashboard and Android v0.1 app are available. Keep originals on a host you control.</p>
    </div>
  </section>;
}
