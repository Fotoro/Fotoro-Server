import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { Pricing } from "@/components/site/pricing";
import { FadeIn } from "@/components/site/fade-in";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Fotoro core is free and open source. Optional lifetime add-ons for semantic search.",
};

export default function PricingPage() {
  return (
    <PageShell>
      <FadeIn className="container-tight pb-8 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Pricing</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Own your archive. Pay once, not forever.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
          The core app is free and self-hosted. Optional lifetime licenses unlock advanced AI
          features — no subscriptions, ever.
        </p>
      </FadeIn>
      <Pricing />
    </PageShell>
  );
}
