import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Lock, Server, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { FadeIn } from "@/components/site/fade-in";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Fotoro is a self-hosted photo archive with local AI — built for people who want to own their memories.",
};

const VALUES = [
  {
    icon: Lock,
    title: "Privacy by architecture",
    body: "Your photos never leave your hardware. No cloud uploads, no telemetry, no training on your data. Fotoro is designed so privacy isn't a setting — it's the default.",
  },
  {
    icon: Server,
    title: "Self-hosted, always",
    body: "Run Fotoro on the laptop, mini-PC, or NAS you already own. One binary, no Docker maze, no monthly rent for your own life.",
  },
  {
    icon: Sparkles,
    title: "Intelligence that stays local",
    body: "Multimodal embeddings and semantic search run on your machine. Ask for \"red shirt at the beach\" and get results in milliseconds — without sending a single pixel to the cloud.",
  },
  {
    icon: Heart,
    title: "Built for real memories",
    body: "Years of camera rolls, messy video dumps, family events, trips, and everyday moments. Fotoro is an archive you can actually search, not just another backup folder.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <div className="container-tight pb-24">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            About {SITE.name}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Your memories deserve to live on <span className="gradient-text">your hardware</span>
          </h1>
          <p className="mt-5 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            {SITE.description}
          </p>
        </FadeIn>

        <div className="mt-20 grid gap-6 sm:grid-cols-2">
          {VALUES.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 ring-soft transition-colors hover:border-foreground/20">
                <item.icon className="mb-4 size-5 text-foreground" />
                <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2} className="mt-20">
          <SectionHeading
            eyebrow="Our story"
            title="Why we built Fotoro"
            subtitle="Cloud photo services are convenient — until they're not. Subscriptions creep up, terms change, and your entire visual history sits on someone else's servers."
            align="left"
          />
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Fotoro started from a simple frustration: finding a photo from three years ago
              shouldn&apos;t require scrolling through ten thousand thumbnails or hoping you tagged
              it correctly. And it definitely shouldn&apos;t mean uploading your private life to a
              company that might use it for training.
            </p>
            <p>
              We built Fotoro as the photo archive we wanted for ourselves — automatic backups from
              every device, intelligent organization, and search that understands what&apos;s in the
              image, all running locally with Tailscale for secure remote access.
            </p>
            <p>
              Fotoro is open source under the MIT license. Star us on GitHub, run it on your
              Fedora laptop or home server, and never pay rent for your own memories again.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.25} className="mt-16 text-center">
          <Button asChild size="lg" className="group">
            <Link href="/download">
              Get started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </PageShell>
  );
}
