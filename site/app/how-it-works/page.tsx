import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { HowItWorks } from "@/components/site/how-it-works";
import { Roadmap } from "@/components/site/roadmap";
import { WhoItsFor } from "@/components/site/who-its-for";
import { FadeIn } from "@/components/site/fade-in";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Install Fotoro, connect Tailscale, pair your devices, and search your entire library in natural language.",
};

export default function HowItWorksPage() {
  return (
    <PageShell mainClassName="pb-8">
      <FadeIn className="container-tight pb-8 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">How it works</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          From install to intelligent search in minutes
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
          Download Fotoro, run setup on your laptop, sign in with Google, and your private photo
          server is ready — accessible from anywhere via Tailscale.
        </p>
      </FadeIn>
      <HowItWorks />
      <WhoItsFor />
      <Roadmap />
    </PageShell>
  );
}
