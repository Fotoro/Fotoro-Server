"use client";

import * as React from "react";
import Image from "next/image";
import { Check, HardDrive, Smartphone, ShieldCheck } from "lucide-react";

const moments = [
  { title: "From your phone", eyebrow: "01 / ARRIVE", description: "A photo leaves your phone in the background. Pause whenever you like; interrupted transfers can continue.", detail: "Background upload", icon: Smartphone },
  { title: "Checked, then kept", eyebrow: "02 / VERIFY", description: "The server verifies the original by SHA-256 before it calls the upload complete. Copies are tracked separately.", detail: "Original verified", icon: ShieldCheck },
  { title: "Back in its moment", eyebrow: "03 / REMEMBER", description: "Capture time places the photograph where it belongs. Small previews make the timeline light to browse.", detail: "In your timeline", icon: HardDrive },
];

export function ProductTheatre() {
  const [active, setActive] = React.useState(2);
  const moment = moments[active];
  return <section id="archive-preview" className="scroll-mt-20 border-b border-border py-24 sm:py-36">
    <div className="container-tight">
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_.65fr]">
        <div><p className="text-xs tracking-[.15em] text-[hsl(var(--brand))]">THE JOURNEY OF A PHOTOGRAPH</p><h2 className="font-display mt-5 max-w-2xl text-balance text-6xl leading-[.95] sm:text-8xl">A place for every <em>moment.</em></h2></div>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:justify-self-end">From the first backup to a late-night rediscovery, every step is visible and every original stays yours.</p>
      </div>
      <div className="mt-12 grid overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_25px_90px_rgba(0,0,0,.12)] lg:grid-cols-[.55fr_1.45fr]">
        <div className="flex flex-col justify-between border-b border-border p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <div><p className="text-xs text-muted-foreground">An illustrative archive preview</p><moment.icon className="mt-10 size-7 text-[hsl(var(--brand))]" strokeWidth={1.4} /><p className="mt-7 text-xs tracking-[.12em] text-[hsl(var(--brand))]">{moment.eyebrow}</p><h3 className="font-display mt-3 text-5xl leading-none sm:text-6xl">{moment.title}</h3><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">{moment.description}</p></div>
          <div className="mt-12 space-y-2" aria-label="Preview steps">{moments.map((item, index) => <button type="button" key={item.title} aria-pressed={active === index} onClick={() => setActive(index)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${active === index ? "border-[hsl(var(--brand))] bg-[hsl(var(--brand))]/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"}`}><span><span className="mr-3 font-mono text-xs">0{index + 1}</span>{item.title}</span>{active === index && <Check className="size-4" />}</button>)}</div>
        </div>
        <div className="relative min-h-[510px] overflow-hidden bg-[#E6DBCE] p-5 text-[#201B16] sm:p-10">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl bg-[#FBF8F4] shadow-[0_22px_80px_rgba(50,35,20,.2)]">
            <div className="flex items-center justify-between border-b border-[#DCD4CC] px-5 py-4"><span className="font-display text-2xl">fotoro<span className="text-[#BD634A]">.</span></span><span className="text-[11px] text-[#746C62]">MY LIBRARY</span></div>
            <div className="p-5 sm:p-7"><div className="flex items-end justify-between"><div><span className="text-[10px] tracking-[.15em] text-[#856C5C]">THE TIMELINE</span><h4 className="font-display mt-1 text-4xl">The days we keep.</h4></div><span className="hidden rounded-full border border-[#D7CAC0] px-3 py-1 text-[10px] sm:block">2024 — 2026</span></div>
              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3"><div className="relative aspect-[.8] overflow-hidden rounded-md"><Image src="/editorial/lake-walk.webp" alt="Two friends walking by a lake" fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover photo-lift" /></div><div className="relative aspect-[.8] overflow-hidden rounded-md"><Image src="/editorial/coast-memory.webp" alt="The coast at dusk" fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover photo-lift" /></div><div className="relative aspect-[.8] overflow-hidden rounded-md"><Image src="/editorial/printed-memories.webp" alt="Printed photographs on a table" fill sizes="(max-width: 640px) 30vw, 200px" className="object-cover photo-lift" /></div></div>
              <div className="mt-6 flex items-center justify-between border-t border-[#E4DED7] pt-4 text-[11px]"><span className="text-[#746C62]">{moment.detail}</span><span className="inline-flex items-center gap-1.5 text-[#446C52]"><Check className="size-3" /> Verified</span></div>
            </div>
          </div>
          <p className="mt-7 text-center text-xs text-[#67594E]">An interface preview. Your archive shows your own photographs.</p>
        </div>
      </div>
    </div>
  </section>;
}
