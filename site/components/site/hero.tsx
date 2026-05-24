"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  HardDrive,
  Lock,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_RESULTS = [
  { id: 1, label: "Goa · Aug 2024", tone: "from-white/25 to-white/[0.03]" },
  { id: 2, label: "Beach · Sunset", tone: "from-zinc-200/20 to-zinc-900/10" },
  { id: 3, label: "Family · Diwali", tone: "from-white/15 via-zinc-400/10 to-zinc-900/5" },
  { id: 4, label: "Anya · Yellow dress", tone: "from-zinc-100/25 to-zinc-700/5" },
  { id: 5, label: "Hikes · 2023", tone: "from-white/10 to-white/[0.02]" },
  { id: 6, label: "Birthday · Candles", tone: "from-zinc-300/20 to-zinc-800/5" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-line-grid opacity-30 mask-fade-radial"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-brand-glow"
      />

      <div className="container-tight">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <Badge variant="brand" className="mb-6">
            <Sparkles className="size-3" />
            Local multimodal AI · v0.4 shipping
          </Badge>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[68px]">
            <span className="gradient-text">Own your memories.</span>
            <br />
            Search them like magic.
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Fotoro is a fully self-hosted, open-source photo &amp; video archive with a
            local multimodal AI that understands what&apos;s inside every frame —
            colors, clothing, places, people, moments. <span className="text-foreground/90">No cloud. No tracking. No subscriptions.</span>
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="xl" className="group">
              <Link href="/download">
                Download Desktop App
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/docs#self-host">Get Started (Self-Host)</Link>
            </Button>
            <Button asChild size="xl" variant="ghost" className="text-muted-foreground">
              <Link href="#demo">
                <Play className="size-4" /> Watch demo
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-foreground" />
              MIT licensed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HardDrive className="size-3.5 text-foreground" />
              SHA-256 deduped storage
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu className="size-3.5 text-foreground" />
              Runs on a Raspberry Pi 5
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-foreground" />
              Zero telemetry
            </span>
          </div>
        </motion.div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="absolute inset-x-0 -top-12 mx-auto h-24 max-w-3xl bg-brand-glow opacity-60" />
      <div className="relative rounded-2xl border border-border bg-card/60 p-2 shadow-[0_30px_80px_-30px_hsl(0_0%_100%/0.16),0_0_0_1px_hsl(var(--border))] backdrop-blur">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-zinc-700" />
            <span className="size-2.5 rounded-full bg-zinc-600" />
            <span className="size-2.5 rounded-full bg-zinc-500" />
          </span>
          <div className="mx-auto flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-white animate-pulse-soft" />
            fotoro.local · indexed 24,381 items
          </div>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-[260px_1fr]">
          <aside className="hidden md:block">
            <div className="space-y-1 text-sm">
              {[
                { l: "Library", c: "24,381" },
                { l: "Favorites", c: "412" },
                { l: "People", c: "38" },
                { l: "Places", c: "61" },
                { l: "Events", c: "172" },
              ].map((i) => (
                <div
                  key={i.l}
                  className="flex items-center justify-between rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <span>{i.l}</span>
                  <span className="font-mono text-[11px] text-muted-foreground/70">{i.c}</span>
                </div>
              ))}
            </div>
            <div className="my-4 h-px bg-border" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground/70">
              Devices
            </div>
            <div className="mt-2 space-y-2 text-xs">
              {[
                { n: "Pixel 8 Pro", s: "Synced 2m ago" },
                { n: "MacBook Pro", s: "Hosting" },
                { n: "iPad Air", s: "Indexing" },
              ].map((d) => (
                <div key={d.n} className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
                  <span className="font-medium text-foreground">{d.n}</span>
                  <span className="text-muted-foreground">{d.s}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <div id="demo" className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 ring-soft">
              <Search className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                red shirt and blue pants at the beach last summer
              </span>
              <span className="ml-auto rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3">
              {MOCK_RESULTS.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.05 }}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-gradient-to-br ${r.tone} ring-soft`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_hsl(var(--foreground)/0.18),_transparent_60%)]" />
                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-between text-[10px] font-medium text-foreground/90">
                    <span className="rounded-full bg-background/60 px-2 py-0.5 backdrop-blur">
                      {r.label}
                    </span>
                    <span className="rounded-full bg-background/60 px-2 py-0.5 font-mono text-[9px] backdrop-blur">
                      0.{92 - i * 2}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
