import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { FeaturesBento } from "@/components/site/features-bento";
import { SearchDemo } from "@/components/site/search-demo";
import { IntelligenceLayer } from "@/components/site/intelligence-layer";
import { FadeIn } from "@/components/site/fade-in";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Semantic search, local AI, automatic backups, and content-addressed storage — all self-hosted.",
};

export default function FeaturesPage() {
  return (
    <PageShell mainClassName="pb-8">
      <FadeIn className="container-tight pb-8 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Product</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything you need in a private photo archive
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
          Fotoro combines reliable backups, smart organization, and local multimodal AI — without
          sending a single byte to the cloud.
        </p>
      </FadeIn>
      <FeaturesBento />
      <SearchDemo />
      <IntelligenceLayer />
    </PageShell>
  );
}
