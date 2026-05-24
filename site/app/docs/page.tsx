import type { Metadata } from "next";
import Link from "next/link";
import { Book, ExternalLink, Shield } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DocsSidebar } from "@/components/docs/sidebar";
import { CodeBlock } from "@/components/docs/code-block";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Self-host Fotoro in 5 minutes. Setup guide, API reference, troubleshooting, and privacy notice.",
};

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-doc-section
      className="scroll-mt-24 border-t border-border pt-12 first:border-0 first:pt-0"
    >
      {eyebrow ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Port 8080 is already in use. How do I change it?",
    a: "Pass --port=9090 to the binary, or set FOTORO_PORT=9090 in your environment. The desktop app exposes the same option in Settings → Server.",
  },
  {
    q: "My phone can’t discover the server on the local network.",
    a: "Most home routers block mDNS by default. Either enable it in router admin, or use the QR pairing flow in the dashboard — it embeds the IP address directly so no discovery is needed.",
  },
  {
    q: "I have a GPU. How do I enable hardware acceleration for embeddings?",
    a: "On NVIDIA, install CUDA 12+ and run with --accel=cuda. On Apple Silicon, CoreML is auto-detected. On Linux with AMD/Intel GPUs, --accel=vulkan works with most modern cards.",
  },
  {
    q: "How do I expose Fotoro to the internet safely?",
    a: "Don’t expose port 8080 directly. Use Tailscale (recommended), a reverse proxy with HTTPS (Caddy, Traefik), or Cloudflare Tunnel. Fotoro never relies on a third-party relay.",
  },
  {
    q: "Does Fotoro re-encode my videos?",
    a: "Never. Originals are stored bit-for-bit in the content-addressed filesystem. We only generate small WebP thumbnails for the gallery and a few frames for the embedding model.",
  },
  {
    q: "Can I run it in Docker behind another service?",
    a: "Yes — see the Docker section above. Mount your media volume read-write, and a separate volume for the SQLite metadata DB. Don’t put both on a network share.",
  },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-24">
        <div className="container-tight">
          <div className="mb-10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand">
                <Book className="size-3" /> Docs · v{SITE.version}
              </Badge>
              <Badge variant="outline">
                Last updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Self-host Fotoro in 5 minutes.
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Everything you need to install, operate, and extend a private
              Fotoro instance. Built for tinkerers, not enterprise reviewers.
            </p>
          </div>

          <div className="flex gap-10">
            <DocsSidebar />
            <article className="min-w-0 flex-1 pb-32">
              <Section id="overview" eyebrow="Start here" title="Overview">
                <p>
                  Fotoro is a single Go binary that serves a web gallery, an HTTP
                  API, and a background worker pool that handles thumbnails,
                  metadata extraction, face detection, and multimodal embeddings.
                  All state lives in two places: your media directory and a SQLite
                  database next to it.
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Default HTTP port: <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">8080</code></li>
                  <li>Storage layout: <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">/data/&lt;sha256[0:2]&gt;/&lt;sha256&gt;.ext</code></li>
                  <li>Metadata DB: <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">metadata.db</code> (SQLite, WAL mode)</li>
                </ul>
              </Section>

              <Section id="self-host" eyebrow="Setup" title="Self-host guide">
                <p>
                  The fastest way to get started is Docker. It works on any host
                  that has Docker installed — including Raspberry Pi 5 with the
                  64-bit OS.
                </p>
                <CodeBlock
                  lang="docker"
                  code={`docker run -d \\
  --name fotoro \\
  --restart unless-stopped \\
  -p 8080:8080 \\
  -v /srv/fotoro/media:/data \\
  -v /srv/fotoro/db:/state \\
  fotoro/fotoro:latest`}
                />
                <p>
                  Prefer the native binary? Grab the latest release from{" "}
                  <Link
                    href={`${SITE.github}/releases`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    GitHub
                    <ExternalLink className="ml-0.5 inline size-3" />
                  </Link>{" "}
                  and run it directly.
                </p>
                <CodeBlock
                  lang="bash"
                  code={`curl -L https://get.fotoro.app/install.sh | bash
fotoro init --data /srv/fotoro/media
fotoro serve`}
                />
              </Section>

              <Section id="first-sync" title="Your first sync">
                <ol className="ml-5 list-decimal space-y-2">
                  <li>Open <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">http://&lt;host&gt;:8080</code> on your laptop.</li>
                  <li>Sign in with the OAuth provider of your choice (or set up a local admin account).</li>
                  <li>Open the Fotoro mobile app and scan the QR shown on the dashboard.</li>
                  <li>Pick which albums to back up. The first sync runs in the background — no need to keep the app open.</li>
                </ol>
              </Section>

              <Section id="ai" eyebrow="Operate" title="Local AI models">
                <p>
                  Fotoro ships with a small CLIP-style image encoder for fast
                  preview embeddings, and an optional larger Gemini-2-inspired
                  multimodal encoder (downloaded on first use) for the highest
                  quality semantic search.
                </p>
                <CodeBlock
                  lang="bash"
                  code={`fotoro ai pull image-base
fotoro ai pull multimodal-large   # ~ 480 MB, optional
fotoro ai bench                    # quick perf check`}
                />
                <p>
                  Models are unloaded between batches by default to keep memory
                  usage minimal. Set <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">FOTORO_AI_KEEPALIVE=5m</code> if you have
                  RAM to spare and want lower latency on the first query.
                </p>
              </Section>

              <Section id="backups" title="Backups & deduplication">
                <p>
                  Because Fotoro stores files keyed by SHA-256, your media
                  directory is naturally deduplicated and safe to rsync to a
                  second disk, a NAS, or an off-site location.
                </p>
                <CodeBlock
                  lang="bash"
                  code={`rsync -aHAX --info=progress2 \\
  /srv/fotoro/media/ user@backup.local:/tank/fotoro/media/`}
                />
              </Section>

              <Section id="api" title="HTTP API">
                <p>
                  The server exposes a small REST API used by the apps. Below are
                  the most common endpoints — full reference in the repo.
                </p>
                <CodeBlock
                  lang="http"
                  code={`GET    /health
POST   /upload
GET    /photos?page=1&limit=100
GET    /photos/:id
DELETE /photos/:id
GET    /thumbnails/:id
POST   /search    { "q": "red shirt at the beach", "limit": 24 }`}
                />
              </Section>

              <Section
                id="troubleshooting"
                eyebrow="Support"
                title="Troubleshooting"
              >
                <p>
                  These are the issues that come up most often during setup. If
                  yours isn&apos;t here, hop into the GitHub Discussions.
                </p>
                <div className="overflow-hidden rounded-xl border border-border bg-card ring-soft">
                  <Accordion type="single" collapsible className="px-5">
                    {FAQS.map((f) => (
                      <AccordionItem key={f.q} value={f.q}>
                        <AccordionTrigger>{f.q}</AccordionTrigger>
                        <AccordionContent>{f.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </Section>

              <Section id="privacy" title="Privacy notice">
                <p>
                  Fotoro does not collect analytics, does not phone home, and does
                  not include any third-party trackers on its website or in the
                  apps. The only network calls the server makes by default are
                  (1) downloading model weights from a configurable mirror on
                  first use, and (2) checking GitHub for new releases (opt-out
                  via <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">FOTORO_UPDATE_CHECK=off</code>).
                </p>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Shield className="size-4 text-foreground" />
                    What stays local
                  </p>
                  <ul className="mt-2 ml-5 list-disc text-sm">
                    <li>All media files and thumbnails</li>
                    <li>All embeddings (image, video, text, face)</li>
                    <li>All EXIF, GPS, and people metadata</li>
                    <li>All pairing tokens and device records</li>
                  </ul>
                </div>
              </Section>

              <Section id="license" title="License (MIT)">
                <p>
                  Fotoro is released under the MIT license. You are free to use,
                  modify and self-host it for personal and commercial use.
                </p>
                <CodeBlock
                  lang="text"
                  code={`Copyright (c) ${new Date().getFullYear()} Fotoro contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software …`}
                />
              </Section>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
