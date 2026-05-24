"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "./section-heading";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  caption: string;
  meta: string;
  score: number;
  tone: string;
};

const TONES = [
  "from-white/30 to-white/[0.03]",
  "from-zinc-200/25 to-zinc-900/5",
  "from-white/20 via-zinc-400/10 to-zinc-900/5",
  "from-zinc-100/25 to-zinc-700/5",
  "from-white/15 to-white/[0.02]",
  "from-zinc-300/20 to-zinc-800/5",
];

const QUERY_LIBRARY: { q: string; results: Result[] }[] = [
  {
    q: "red shirt and blue pants at the beach last summer",
    results: [
      { id: "g1", caption: "Goa · Aug 2024", meta: "Jio · Anya", score: 0.94, tone: TONES[0] },
      { id: "g2", caption: "Beach walk · Sunset", meta: "Pixel 8 Pro", score: 0.91, tone: TONES[1] },
      { id: "g3", caption: "Kayaking · 2024", meta: "GoPro 12", score: 0.88, tone: TONES[2] },
      { id: "g4", caption: "Sandcastle", meta: "iPhone 15", score: 0.86, tone: TONES[3] },
      { id: "g5", caption: "Boat trip", meta: "Pixel 8 Pro", score: 0.84, tone: TONES[4] },
      { id: "g6", caption: "Beach picnic", meta: "Anya · Mom", score: 0.81, tone: TONES[5] },
    ],
  },
  {
    q: "my daughter in her yellow dress blowing candles",
    results: [
      { id: "b1", caption: "Anya · Birthday 7", meta: "Mar 2024", score: 0.97, tone: TONES[3] },
      { id: "b2", caption: "Cake reveal", meta: "Living room", score: 0.93, tone: TONES[0] },
      { id: "b3", caption: "Family group", meta: "8 people", score: 0.9, tone: TONES[5] },
      { id: "b4", caption: "Candle close-up", meta: "Macro", score: 0.88, tone: TONES[1] },
      { id: "b5", caption: "Aftermath", meta: "iPhone 15", score: 0.84, tone: TONES[4] },
      { id: "b6", caption: "Hug · Dad", meta: "10s clip", score: 0.81, tone: TONES[2] },
    ],
  },
  {
    q: "sunset photos with palm trees, no people",
    results: [
      { id: "s1", caption: "Maldives · 2023", meta: "Sony A7", score: 0.95, tone: TONES[1] },
      { id: "s2", caption: "Goa · Palolem", meta: "Sunset", score: 0.93, tone: TONES[5] },
      { id: "s3", caption: "Sri Lanka", meta: "Drone", score: 0.9, tone: TONES[0] },
      { id: "s4", caption: "Andaman · Havelock", meta: "iPhone", score: 0.89, tone: TONES[3] },
      { id: "s5", caption: "Bali · Uluwatu", meta: "GoPro", score: 0.86, tone: TONES[2] },
      { id: "s6", caption: "Pondicherry", meta: "Phone", score: 0.83, tone: TONES[4] },
    ],
  },
  {
    q: "video clips of the dog running on grass",
    results: [
      { id: "d1", caption: "Buddy · Park run", meta: "4K · 12s", score: 0.96, tone: TONES[2] },
      { id: "d2", caption: "Fetch · Slow-mo", meta: "240fps", score: 0.93, tone: TONES[5] },
      { id: "d3", caption: "Sprint", meta: "Pixel · 8s", score: 0.91, tone: TONES[0] },
      { id: "d4", caption: "Sunday walk", meta: "iPhone · 22s", score: 0.88, tone: TONES[4] },
      { id: "d5", caption: "Tug of war", meta: "6s", score: 0.84, tone: TONES[1] },
      { id: "d6", caption: "Buddy + kids", meta: "Backyard", score: 0.82, tone: TONES[3] },
    ],
  },
];

export function SearchDemo() {
  const [active, setActive] = React.useState(0);
  const [query, setQuery] = React.useState(QUERY_LIBRARY[0].q);
  const [pending, setPending] = React.useState(false);
  const [results, setResults] = React.useState<Result[]>(
    QUERY_LIBRARY[0].results
  );

  const runQuery = React.useCallback((q: string, idx?: number) => {
    setQuery(q);
    setPending(true);
    const match =
      idx !== undefined
        ? QUERY_LIBRARY[idx]
        : QUERY_LIBRARY.find((p) => p.q.toLowerCase() === q.toLowerCase());
    setTimeout(() => {
      setResults(
        match
          ? match.results
          : QUERY_LIBRARY[Math.floor(Math.random() * QUERY_LIBRARY.length)].results
      );
      setPending(false);
    }, 380);
  }, []);

  return (
    <section id="intelligence" className="container-tight scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="The intelligence layer"
        title={
          <>
            Search your library the way <em>you</em> remember it.
          </>
        }
        subtitle="Inspired by Google's Gemini Embedding 2 — a natively multimodal model that understands text, images and video in a single vector space. Optimized to run locally, with a tiny memory footprint."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Try a real query
          </p>
          {QUERY_LIBRARY.map((p, i) => (
            <button
              key={p.q}
              onClick={() => {
                setActive(i);
                runQuery(p.q, i);
              }}
              className={cn(
                "w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                active === i
                  ? "border-white/25 bg-white/[0.04] text-foreground"
                  : "border-border bg-card/40 text-muted-foreground hover:border-white/20 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <Sparkles
                  className={cn(
                    "size-3.5 shrink-0",
                    active === i ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-hidden
                />
                {p.q}
              </span>
            </button>
          ))}
        </aside>

        <div className="rounded-2xl border border-border bg-card p-2 ring-soft">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runQuery(query);
            }}
            className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"
          >
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe a memory…"
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            <Button size="sm" type="submit" disabled={pending}>
              <Wand2 className="size-3.5" />
              {pending ? "Searching…" : "Run"}
            </Button>
          </form>

          <div className="mt-3 flex items-center justify-between px-2 text-xs text-muted-foreground">
            <span>
              <Badge variant="outline" className="border-border/80">
                {results.length} matches
              </Badge>
            </span>
            <span className="font-mono">
              {pending ? "embedding query…" : "vector + EXIF rerank · 38ms"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {results.map((r, i) => (
                <motion.div
                  layout
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.28, delay: i * 0.03 }}
                  className={cn(
                    "group relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-gradient-to-br ring-soft",
                    r.tone
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--foreground)/0.18),_transparent_60%)]" />
                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-between text-[10px] font-medium text-foreground/90">
                    <span className="rounded-full bg-background/65 px-2 py-0.5 backdrop-blur">
                      {r.caption}
                    </span>
                    <span className="rounded-full bg-background/65 px-2 py-0.5 font-mono text-[9px] backdrop-blur">
                      {r.score.toFixed(2)}
                    </span>
                  </div>
                  <div className="absolute left-2 top-2 rounded-full bg-background/65 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur">
                    {r.meta}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
