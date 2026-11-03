import type { Metadata } from "next";
import { publicMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = publicMetadata("How it works", "From local media to a searchable, backed-up Fotoro timeline.", "/how-it-works");

const steps = [
  { number: "01", title: "Give it a home", text: "Build Fotoro on a Linux host, run setup, and choose primary storage. Connect a separate backup target if you have one.", line: "Linux host → local library" },
  { number: "02", title: "Bring your images in", text: "Import an existing folder or upload through the web dashboard. The server hashes each original and can resume an interrupted upload.", line: "Source → verified original" },
  { number: "03", title: "Make another copy", text: "The backup worker checks what still needs a second copy. The dashboard shows verified, pending and failed items.", line: "Primary → backup target" },
  { number: "04", title: "Open the timeline", text: "Sign in, reach your linked server over its private route, and browse date-grouped previews. Open an original only when you need it.", line: "Your server → your screen" },
];

const questions = [
  { question: "Where does Fotoro store original photos?", answer: "Fotoro stores originals on the Linux host you choose. Supabase holds account and linked-server information, not the media files." },
  { question: "Does Fotoro delete photos from my phone?", answer: "No. The Android app never deletes phone media after upload. It reports when the host has one verified copy and when an independent backup target has a second verified copy." },
  { question: "Can an interrupted backup resume?", answer: "Yes. The Android app and browser use resumable upload sessions. When a session is still available, they continue from the byte offset saved by the host." },
  { question: "Does the server need to stay busy all day?", answer: "No. The owner starts a user socket manually. A request wakes the API, and the service returns to socket standby after ten idle minutes." },
];

export default function HowItWorksPage() {
  return <PageShell mainClassName="how-shell"><div className="how-page container-tight pb-28">
    <div className="grid gap-8 border-b border-border pb-14 lg:grid-cols-[1fr_0.55fr]"><div><p className="text-xs tracking-[.15em] text-[hsl(var(--brand))]">FROM SOURCE TO SCREEN</p><h1 className="font-display mt-5 max-w-3xl text-balance text-6xl leading-[.92] sm:text-8xl">A path for every <em>original.</em></h1></div><p className="self-end text-base leading-relaxed text-muted-foreground">Fotoro keeps ingest, storage, verification and browsing visible. The archive lives on the machine you choose.</p></div>
    <div className="relative mt-8 border-l border-border sm:ml-8">{steps.map((step) => <section key={step.number} className="relative grid gap-4 border-b border-border py-12 pl-8 sm:py-16 sm:pl-14 lg:grid-cols-[.7fr_1fr]"><span className="absolute -left-[5px] top-[3.5rem] size-[9px] rounded-full bg-[hsl(var(--brand))] sm:top-[4.5rem]" /><div><span className="font-display text-4xl italic text-[hsl(var(--brand))]">{step.number}</span><h2 className="font-display mt-6 text-4xl sm:text-5xl">{step.title}</h2></div><div className="self-end"><p className="max-w-lg text-base leading-8 text-muted-foreground">{step.text}</p><p className="mt-6 text-xs text-[hsl(var(--brand))]">{step.line}</p></div></section>)}</div>
    <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[1.5rem] bg-card p-8 sm:p-12"><p className="font-display max-w-xl text-4xl leading-tight sm:text-5xl">Start with a host you control. Add your phone when you are ready.</p><Link href="/download" className="inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium">Get started <ArrowUpRight className="size-4" /></Link></div>
    <section className="mt-20 max-w-3xl" aria-labelledby="questions-heading">
      <h2 id="questions-heading" className="font-display text-5xl">Common questions</h2>
      <div className="mt-6 divide-y divide-border border-y border-border">{questions.map((item) => <div key={item.question} className="py-6"><h3 className="text-lg font-medium">{item.question}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{item.answer}</p></div>)}</div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map((item) => ({
        "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }) }} />
  </div></PageShell>;
}
