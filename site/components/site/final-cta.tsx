import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCTA() {
  return <section className="container-tight pb-28 sm:pb-40">
    <div className="relative overflow-hidden rounded-[1.5rem] bg-[#D77358] px-7 py-14 text-[#261D19] sm:px-12 sm:py-20">
      <p className="relative text-xs tracking-[.14em]">YOUR STORAGE, YOUR DECISIONS</p>
      <div className="relative mt-7 flex flex-wrap items-end justify-between gap-8">
        <h2 className="font-display max-w-2xl text-balance text-6xl leading-[.94] sm:text-8xl">Give your archive <em>a home.</em></h2>
        <Link href="/download" className="inline-flex items-center gap-3 rounded-full bg-[#261D19] px-6 py-3 text-sm font-medium text-[#F7F4F0] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#43332D]">Set up Fotoro <ArrowUpRight className="size-4" /></Link>
      </div>
      <p className="relative mt-8 max-w-lg text-sm leading-relaxed">The Linux server, web dashboard and Android v0.1 app are available. Keep originals on a host you control.</p>
    </div>
  </section>;
}
