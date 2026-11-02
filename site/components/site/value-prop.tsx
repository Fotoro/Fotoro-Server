import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";

export function ValueProp() {
  return <section className="container-tight py-28 sm:py-40">
    <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
      <div className="relative aspect-[1.12] overflow-hidden rounded-[1.5rem] bg-[#514C45]"><Image src="/editorial/printed-memories.webp" alt="A collection of printed photographs in warm afternoon light" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover photo-lift" /><div className="absolute bottom-5 left-5 rounded-lg bg-[#F7F4F0]/95 px-4 py-3 text-xs text-[#332B25] shadow-xl"><span className="inline-flex items-center gap-2"><Check className="size-4 text-[#4B7655]" /> Original verified</span><span className="mt-1 block pl-6 text-[#756B62]">A memory, safely kept.</span></div></div>
      <div><p className="text-xs tracking-[.15em] text-[hsl(var(--brand))]">THE ORIGINAL MATTERS</p><h2 className="font-display mt-5 max-w-lg text-balance text-6xl leading-[.94] sm:text-8xl">Nothing lost <em>in the making.</em></h2><p className="mt-8 max-w-md text-base leading-8 text-muted-foreground">Your full-size files live on the storage you choose. Fotoro checks each upload, tracks separate backup copies, and shows when a photo is safe to remove from your phone.</p><Link href="/features" className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-2 text-sm font-medium transition-colors hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]">Explore the features <ArrowUpRight className="size-4" /></Link></div>
    </div>
    <div className="mt-32 grid gap-8 border-y border-border py-10 md:grid-cols-3 md:gap-14">
      <div><span className="font-display text-3xl italic text-[hsl(var(--brand))]">01</span><h3 className="mt-5 text-lg font-medium">Backup that can wait</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">Automatic Android transfers run in the background. Pause, resume, and see progress without giving up your phone.</p></div>
      <div><span className="font-display text-3xl italic text-[hsl(var(--brand))]">02</span><h3 className="mt-5 text-lg font-medium">A timeline that feels instant</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">Capture dates put moments in order. Light previews and a virtualized gallery keep thousands of images easy to move through.</p></div>
      <div><span className="font-display text-3xl italic text-[hsl(var(--brand))]">03</span><h3 className="mt-5 text-lg font-medium">Your machine, your call</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">Start the Linux host when you want it. See storage, backup and device state from the web dashboard.</p></div>
    </div>
  </section>;
}
