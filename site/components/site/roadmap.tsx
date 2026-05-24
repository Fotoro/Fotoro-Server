import { CalendarClock, Languages, Map, MicVocal, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "./section-heading";

const ROADMAP = [
  {
    quarter: "Q3 · 2026",
    status: "Shipping",
    statusTone: "brand" as const,
    icon: Users,
    title: "Face cards & people albums",
    body: "Auto-cluster faces, name them once, browse a lifetime of memories per person — all embeddings stay on your hardware.",
  },
  {
    quarter: "Q4 · 2026",
    status: "Next",
    statusTone: "warning" as const,
    icon: Map,
    title: "Memories map",
    body: "Browse your library by location on a beautiful offline map. Reverse-geocoded with a local gazetteer, no APIs.",
  },
  {
    quarter: "Q4 · 2026",
    status: "Next",
    statusTone: "warning" as const,
    icon: MicVocal,
    title: "Speak to search",
    body: "Local Whisper-small for voice queries on phone and desktop. Hands-free, fully offline.",
  },
  {
    quarter: "2027",
    status: "Planned",
    statusTone: "outline" as const,
    icon: CalendarClock,
    title: "Event clustering",
    body: "Smart auto-grouping into trips, parties, weekends — with editable titles and shareable read-only links.",
  },
  {
    quarter: "2027",
    status: "Planned",
    statusTone: "outline" as const,
    icon: Languages,
    title: "Multi-user, multi-language",
    body: "Family-grade accounts with per-user libraries, shared albums, and 30+ language queries in the embedding model.",
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="container-tight scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Roadmap"
        title="Shipping in the open, every month."
        subtitle="Fotoro is a real codebase with a clear roadmap. No vaporware, no marketing-only promises."
      />

      <div className="relative mx-auto max-w-3xl">
        <div
          aria-hidden
          className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent"
        />
        <ol className="space-y-5">
          {ROADMAP.map((item) => (
            <li
              key={item.title}
              className="relative pl-14"
            >
              <span className="absolute left-0 top-2 inline-flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground">
                <item.icon className="size-4" />
              </span>
              <div className="rounded-xl border border-border bg-card p-5 ring-soft">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-wider">{item.quarter}</span>
                  <Badge variant={item.statusTone}>{item.status}</Badge>
                </div>
                <h3 className="mt-2 text-base font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
