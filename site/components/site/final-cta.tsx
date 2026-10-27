import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCTA() {
  return <section className="container-tight pb-28">
    <div className="matrix-signal relative overflow-hidden px-7 py-12 sm:px-12 sm:py-16">
      <div className="absolute -right-20 -top-20 size-80 rounded-full border-[30px] border-background/15 sm:size-[32rem]" aria-hidden="true" />
      <p className="relative font-mono text-xs font-bold uppercase tracking-[0.2em]">The next chapter starts on your machine</p>
      <div className="relative mt-7 flex flex-wrap items-end justify-between gap-8">
        <h2 className="max-w-2xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">Put your library<br />back in your hands.</h2>
        <Link href="/download" className="inline-flex items-center gap-3 border-2 border-background bg-background px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-foreground transition hover:bg-transparent hover:text-background">Start with the server <ArrowUpRight className="size-4" /></Link>
      </div>
      <p className="relative mt-8 max-w-lg text-sm leading-relaxed">Linux server and web dashboard available from source. Mobile client development is ongoing.</p>
    </div>
  </section>;
}
