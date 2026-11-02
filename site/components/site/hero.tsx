import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Hero() {
  return <section className="relative isolate min-h-[820px] overflow-hidden bg-[#171512] text-[#F5F1EB] sm:min-h-[760px] lg:min-h-[850px]">
    <Image src="/editorial/coast-memory.webp" alt="A quiet coast at dusk, with one person looking out to sea" fill priority sizes="100vw" className="object-cover object-[57%_center] opacity-65" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#100F0D]/95 via-[#100F0D]/68 to-[#100F0D]/5" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#100F0D]/90 via-transparent to-[#100F0D]/15" />
    <div className="container-tight relative flex min-h-[820px] flex-col justify-between pt-40 pb-10 sm:min-h-[760px] sm:pt-44 lg:min-h-[850px] lg:pt-48">
      <div className="max-w-4xl">
        <p className="text-xs tracking-[0.17em] text-[#DCCFC1]">A PRIVATE PHOTO ARCHIVE</p>
        <h1 className="font-display mt-7 text-balance text-[clamp(5rem,12vw,10.8rem)] leading-[.82] tracking-[-.045em]">Your photos.<br /><span className="italic text-[#F0B79F]">On your server.</span></h1>
        <p className="mt-10 max-w-md text-lg leading-relaxed text-[#E1D8CF] sm:text-xl">Originals stay original. Verified, timelined, yours. A calmer place for everything you want to remember.</p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/download" className="inline-flex min-h-12 items-center gap-4 rounded-full bg-[#E07A5F] px-6 py-3 text-sm font-semibold text-[#1A1714] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-[#F0A48B] active:translate-y-0">Get started <ArrowUpRight className="size-4" /></Link>
          <Link href="#archive-preview" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[#F5F1EB]/45 px-6 py-3 text-sm font-medium transition-colors hover:bg-[#F5F1EB]/10">See the archive <ArrowDownRight className="size-4" /></Link>
        </div>
      </div>
      <div className="mt-20 flex flex-wrap items-end justify-between gap-6 border-t border-white/25 pt-5 text-xs text-[#DCCFC1]">
        <span>Linux host · Android backup · Web timeline</span>
        <span className="font-display text-xl italic text-[#F5F1EB]">Made for the moments that stay.</span>
      </div>
    </div>
  </section>;
}
