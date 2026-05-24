import { Box, Brain, Cpu, Gauge } from "lucide-react";
import { SectionHeading } from "./section-heading";

const STATS = [
  {
    icon: Brain,
    label: "Multimodal embeddings",
    value: "1024-D",
    note: "Shared vector space for text, images, and video frames",
  },
  {
    icon: Gauge,
    label: "Query latency",
    value: "<50 ms",
    note: "On 100K-item libraries with HNSW + EXIF rerank",
  },
  {
    icon: Box,
    label: "Idle memory",
    value: "~180 MB",
    note: "Models unloaded between batches by default",
  },
  {
    icon: Cpu,
    label: "Hardware floor",
    value: "Raspberry Pi 5",
    note: "Optional CoreML / CUDA / Vulkan acceleration",
  },
];

export function IntelligenceLayer() {
  return (
    <section className="container-tight py-24">
      <SectionHeading
        eyebrow="Inside the model"
        title={
          <>
            A frontier-class understanding of your library,
            <br className="hidden md:inline" /> running quietly on your hardware.
          </>
        }
        subtitle="Every photo, every video frame, every detected face is embedded into a shared semantic space and combined with traditional metadata for lightning-fast, accurate results."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5 ring-soft"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="size-4 text-foreground" />
              <span className="text-xs uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="mt-4 font-mono text-2xl tracking-tight text-foreground">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
