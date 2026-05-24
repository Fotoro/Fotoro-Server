"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Heart, Infinity as InfinityIcon, Search, ImageDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

type Plan = {
  id: string;
  name: string;
  price: string;
  suffix: string;
  description: string;
  featured?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  cta: { label: string; href: string; variant: "default" | "secondary" };
  features: readonly string[];
};

const PLANS: readonly Plan[] = [
  {
    id: "core",
    name: "Core",
    price: "$0",
    suffix: "forever",
    description: "Everything you need to run a private, self-hosted library.",
    icon: InfinityIcon,
    cta: { label: "Download & self-host", href: "/download", variant: "secondary" },
    features: [
      "Native Android & iOS sync (iOS in waitlist)",
      "Content-addressed filesystem + SHA-256 dedup",
      "Date / event / people folder structures",
      "Web gallery with thumbnails + EXIF metadata",
      "Local face clustering",
      "MIT licensed, 100% open source",
    ],
  },
  {
    id: "semantic",
    name: "Semantic Search",
    price: "$19",
    suffix: "one-time, lifetime",
    description: "Unlock the multimodal AI that makes Fotoro magic.",
    featured: true,
    icon: Search,
    cta: { label: "Unlock semantic search", href: "/download?upgrade=semantic", variant: "default" },
    features: [
      "Local multimodal embedding model (Gemini-2 inspired)",
      "Natural-language search across photos AND video frames",
      "Cross-modal: text → image, image → image",
      "Hybrid rerank with EXIF, location and faces",
      "Hardware acceleration (CoreML, CUDA, Vulkan)",
      "Free upgrades for life",
    ],
  },
  {
    id: "migrator",
    name: "Google Photos Migrator",
    price: "$45",
    suffix: "one-time",
    description: "Pull a decade out of the cloud in a single afternoon.",
    icon: ImageDown,
    cta: { label: "Get the migrator", href: "/download?upgrade=migrator", variant: "secondary" },
    features: [
      "1-click cloud → local pipeline",
      "Full metadata retention (dates, albums, motion photos)",
      "Resumable, deduplicated import",
      "Direct API + Takeout archive support",
      "Verification pass at the end",
    ],
  },
];

export function Pricing() {
  const [tip, setTip] = React.useState("7");

  return (
    <section id="pricing" className="container-tight scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Pricing"
        title="Pay once. Own it forever. No subscriptions."
        subtitle="The Core experience is free and open source — and it always will be. Optional one-time upgrades fund full-time development."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-6 ring-soft",
              plan.featured
                ? "border-white/30 shadow-[0_30px_80px_-30px_hsl(0_0%_100%/0.18)]"
                : "border-border"
            )}
          >
            {plan.featured ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="brand">Most popular</Badge>
              </span>
            ) : null}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/60 text-foreground">
                  <plan.icon className="size-4" />
                </span>
                <h3 className="text-base font-semibold tracking-tight">{plan.name}</h3>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.suffix}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

            <ul className="mt-6 space-y-2.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button asChild variant={plan.cta.variant} size="lg" className="w-full">
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/40 p-6 ring-soft">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background/60 text-foreground">
              <Heart className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Support the developer
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pay what you want — every dollar goes to keeping Fotoro independent.
                Suggested: <span className="text-foreground">$7</span>.
              </p>
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full items-center gap-2 md:w-auto"
          >
            <span className="relative flex-1 md:flex-initial">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                inputMode="decimal"
                pattern="^[0-9]*\.?[0-9]*$"
                value={tip}
                onChange={(e) =>
                  setTip(e.target.value.replace(/[^0-9.]/g, ""))
                }
                className="w-40 pl-7"
                placeholder="7"
                aria-label="Tip amount"
              />
            </span>
            <Button type="submit">Send {`$${tip || "7"}`}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
