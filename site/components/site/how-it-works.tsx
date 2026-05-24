import { ArrowRight, QrCode, Search, Server } from "lucide-react";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    icon: Server,
    label: "1. Host",
    title: "Run the lightweight Go backend",
    body:
      "One binary. ~30 MB RAM at idle. Drop it on a Mac mini, a Raspberry Pi, your gaming PC, or a Docker host — it just works.",
    code: "docker run -d -p 8080:8080 -v ./media:/data fotoro/fotoro",
  },
  {
    icon: QrCode,
    label: "2. Sync",
    title: "Pair your phone with a QR scan",
    body:
      "Open the Fotoro app, scan the QR shown in your dashboard, and the rest happens in the background — automatic, resumable, battery-aware.",
    code: "fotoro pair --device pixel-8-pro",
  },
  {
    icon: Search,
    label: "3. Search",
    title: "Ask in natural language",
    body:
      "Type or speak. The local multimodal model does the heavy lifting and returns the right frames in milliseconds.",
    code: '"sunset photos with palm trees, no people"',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container-tight scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps. One evening. Yours forever."
        subtitle="No accounts, no servers to provision, no monthly bill. Just three small things you do once."
      />

      <div className="relative grid gap-4 md:grid-cols-3">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block"
        />
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            className="relative flex flex-col rounded-xl border border-border bg-card p-6 ring-soft"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/70 text-foreground">
                <step.icon className="size-4" />
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {step.label}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
            <pre className="mt-5 overflow-x-auto rounded-md border border-border bg-background/60 p-3 font-mono text-xs text-foreground/80">
              <code>{step.code}</code>
            </pre>
            {i < STEPS.length - 1 ? (
              <ArrowRight
                aria-hidden
                className="absolute -right-2.5 top-1/2 hidden size-4 -translate-y-1/2 text-border md:block"
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
