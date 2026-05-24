import { Code2, HeartHandshake, Home } from "lucide-react";
import { SectionHeading } from "./section-heading";

const AUDIENCES = [
  {
    icon: HeartHandshake,
    title: "Families",
    body: "Preserve the irreplaceable years of photos and videos without ever handing them over to big tech. Pair every phone in the house and stop paying for storage forever.",
  },
  {
    icon: Home,
    title: "Self-hosters",
    body: "Drop a single Go binary on your NAS, Pi, or Docker host. Plays nicely with Tailscale, reverse proxies, and your existing backup story.",
  },
  {
    icon: Code2,
    title: "Privacy-first power users",
    body: "Tired of opaque algorithms deciding what's worth surfacing? Read the source. Audit the models. Run the entire stack on hardware you own.",
  },
];

export function WhoItsFor() {
  return (
    <section className="container-tight py-24">
      <SectionHeading
        eyebrow="Who Fotoro is for"
        title="Built for people who don't want to rent their memories."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {AUDIENCES.map((a) => (
          <div
            key={a.title}
            className="rounded-xl border border-border bg-card p-6 ring-soft"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-background/70 text-foreground">
              <a.icon className="size-4" />
            </span>
            <h3 className="mt-5 text-base font-semibold tracking-tight">{a.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
