"use client";

import {
  Cpu,
  Database,
  Fingerprint,
  Globe2,
  ImageDown,
  MapPin,
  Search,
  Smartphone,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "./section-heading";

export function FeaturesBento() {
  return (
    <section id="features" className="container-tight scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="The full feature set"
        title={
          <>
            Built for tens of thousands of photos
            <br className="hidden sm:inline" /> &amp; the rare hardware you own.
          </>
        }
        subtitle="Everything below is local-first, low-resource, and survives even if your internet doesn’t."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {/* Big card: Semantic search */}
        <article className="relative col-span-1 row-span-2 overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-4 md:row-span-2">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-line-grid opacity-20 mask-fade-bottom"
          />
          <div className="relative flex h-full flex-col">
            <Badge variant="brand" className="self-start">
              <Search className="size-3" /> Semantic search
            </Badge>
            <h3 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
              Find any frame, just by describing it.
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              A local multimodal embedding model inspired by Gemini Embedding 2
              understands colors, clothing, objects, scenes, emotions and
              activities — and combines them with EXIF, GPS, faces and
              timestamps for results that actually feel like magic.
            </p>

            <div className="mt-6 space-y-2">
              {[
                "red shirt and blue pants at the beach last summer",
                "my daughter in her yellow dress blowing candles",
                "sunset photos with palm trees",
                "video clips of the dog running on grass",
              ].map((q) => (
                <div
                  key={q}
                  className="flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-foreground/90"
                >
                  <Search className="size-3.5 text-muted-foreground" />
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <Smartphone className="size-3" /> Mobile
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Native Android, iOS coming
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Background sync over local Wi-Fi or the internet. Resumable
            uploads, battery-aware, offline-first.
          </p>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <Database className="size-3" /> Storage
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Content-addressed + deduped
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            SHA-256 keyed filesystem. Same photo uploaded from 5 devices?
            Stored exactly once.
          </p>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <Cpu className="size-3" /> Local AI
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Resource-friendly by design
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tiny memory footprint, sequential or batched processing, idles when
            you&apos;re working. Stays snappy on a mini-PC.
          </p>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <Wifi className="size-3" /> Local-first
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Works offline, syncs when ready
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Discovery over mDNS on your LAN. Optional secure relay for the
            internet — your data never sits on someone else&apos;s cluster.
          </p>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <Fingerprint className="size-3" /> People
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Faces, on-device only
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Face embeddings clustered into people cards. Names you assign never
            leave your server.
          </p>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <MapPin className="size-3" /> Places
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            EXIF, GPS &amp; maps
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Browse memories on a world map. Reverse-geocoded locally with a
            tiny embedded gazetteer.
          </p>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <ImageDown className="size-3" /> Migrate
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Google Photos → Fotoro
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One-click importer keeps full metadata, albums and original
            timestamps. Yes, even motion photos.
          </p>
        </article>

        <article className="overflow-hidden rounded-xl border border-border bg-card p-6 ring-soft md:col-span-2">
          <Badge variant="brand">
            <Globe2 className="size-3" /> Ownership
          </Badge>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            No telemetry. Ever.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Zero analytics, zero phone-home. Read every line on GitHub. MIT
            licensed forever.
          </p>
        </article>
      </div>
    </section>
  );
}
