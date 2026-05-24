import { Cloud, Sparkles, ShieldCheck, FolderTree } from "lucide-react";
import { SectionHeading } from "./section-heading";

const PILLARS = [
  {
    icon: Cloud,
    title: "Automatic, reliable backups",
    body: "Native Android app (iOS coming) that intelligently syncs photos and videos over local Wi-Fi or the internet. Resumable uploads handle large videos without frustration. Works offline-first.",
  },
  {
    icon: FolderTree,
    title: "Perfect storage & organization",
    body: "Content-addressed filesystem with SHA-256 deduplication plus smart compartmentalization — automatic folder structures by date, events, people, and content type. No more messy “Camera Roll” chaos, even with tens of thousands of files.",
  },
  {
    icon: Sparkles,
    title: "Powerful semantic search",
    body: "Describe what you want in plain language — “red shirt and blue pants at the beach last summer”, “my daughter in her yellow dress blowing candles” — and Fotoro returns every matching photo and video frame instantly. No tagging required.",
  },
  {
    icon: ShieldCheck,
    title: "Private by architecture",
    body: "Heavy models run with strict compartmentalization: tiny memory footprint, batched processing, and background workers that never interfere with your day. Everything stays on your hardware — there is no second copy.",
  },
];

export function ValueProp() {
  return (
    <section className="container-tight py-24">
      <SectionHeading
        eyebrow="What makes Fotoro different"
        title={
          <>
            Not another backup tool.
            <br className="hidden sm:inline" /> A smart, private personal archive.
          </>
        }
        subtitle="Fotoro is designed for real life — the years of photos, the messy video dumps, the moments you actually want to find again."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft transition-colors hover:border-white/20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-white/[0.04] blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
            />
            <div className="flex items-start gap-4">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background/70 text-foreground">
                <p.icon className="size-4" />
              </span>
              <div>
                <h3 className="text-base font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
