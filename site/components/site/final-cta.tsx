import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export function FinalCTA() {
  return (
    <section className="container-tight py-24">
      <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16 ring-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-line-grid opacity-25 mask-fade-radial"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-brand-glow opacity-80"
        />

        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Your memories deserve better than the cloud.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          They deserve Fotoro — where ownership meets intelligence. Run it on the hardware
          you already own, and never pay rent for your own life again.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="xl" className="group">
            <Link href="/download">
              Download Fotoro
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href={SITE.github} target="_blank" rel="noreferrer noopener">
              <Github className="size-4" /> Star on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
